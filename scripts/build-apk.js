import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const projectRoot = process.cwd();
const androidDir = path.join(projectRoot, 'android');

// Resolve JDK 21+ compatible with Gradle 8.14
const possibleJdks = [
  process.env.JAVA_HOME,
  path.join(os.homedir(), '.jdks', 'jbr-21.0.11'),
  path.join(os.homedir(), '.jdks', 'corretto-21'),
  'C:\\Program Files\\Eclipse Adoptium\\jdk-21',
  'C:\\Program Files\\Microsoft\\jdk-21',
  'C:\\Program Files\\Java\\jdk-21',
  'C:\\Program Files\\Java\\jdk-17'
].filter(Boolean);

let foundJavaHome = possibleJdks.find((p) => {
  try {
    return fs.existsSync(path.join(p, 'bin', process.platform === 'win32' ? 'java.exe' : 'java'));
  } catch {
    return false;
  }
});

// Fallback to Android Studio JBR if nothing else found
if (!foundJavaHome) {
  const asJbr = 'C:\\Program Files\\Android\\Android Studio\\jbr';
  if (fs.existsSync(path.join(asJbr, 'bin', 'java.exe'))) {
    foundJavaHome = asJbr;
  }
}

const env = { ...process.env };
if (foundJavaHome) {
  env.JAVA_HOME = foundJavaHome;
  env.PATH = `${path.join(foundJavaHome, 'bin')}${path.delimiter}${env.PATH}`;
  console.log(`[build-apk] Usando JAVA_HOME: ${foundJavaHome}`);
}

if (!env.ANDROID_HOME && process.env.LOCALAPPDATA) {
  const sdkPath = path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk');
  if (fs.existsSync(sdkPath)) {
    env.ANDROID_HOME = sdkPath;
    console.log(`[build-apk] Usando ANDROID_HOME: ${sdkPath}`);
  }
}

console.log('\n--- 1. Compilando aplicación web (Vite) ---');
execSync('npm run build', { stdio: 'inherit', env });

console.log('\n--- 2. Sincronizando con Capacitor Android ---');
execSync('npx cap sync android', { stdio: 'inherit', env });

console.log('\n--- 3. Compilando APK con Gradle ---');
const gradlewCmd = process.platform === 'win32' ? '.\\gradlew.bat' : './gradlew';
execSync(`${gradlewCmd} assembleDebug`, {
  cwd: androidDir,
  stdio: 'inherit',
  env
});

const generatedApk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const targetApk = path.join(projectRoot, 'AgroCultiva.apk');

if (fs.existsSync(generatedApk)) {
  fs.copyFileSync(generatedApk, targetApk);
  const sizeMb = (fs.statSync(targetApk).size / (1024 * 1024)).toFixed(2);
  console.log(`\n APK generado exitosamente:`);
  console.log(` -> ${targetApk} (${sizeMb} MB)`);
} else {
  console.error('\n No se encontró el archivo APK generado.');
  process.exit(1);
}
