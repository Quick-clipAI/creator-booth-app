// Run after `cap add android`. Registers the com.creatorbooth.app:// link so that, after Google or
// email sign-in in the phone's browser, Android hands the user back to this app.
// Fails loudly (so the build turns red) rather than silently shipping an app that can't sign in.
import fs from 'node:fs';

const file = 'android/app/src/main/AndroidManifest.xml';
let xml = fs.readFileSync(file, 'utf8');
if (!xml.includes('android:scheme="com.creatorbooth.app"')) {
  const filter = `
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="com.creatorbooth.app" android:host="login-callback" />
            </intent-filter>
`;
  if (!xml.includes('</activity>')) throw new Error('AndroidManifest.xml has no </activity> to patch');
  xml = xml.replace('</activity>', `${filter}        </activity>`);
  fs.writeFileSync(file, xml);
}
if (!fs.readFileSync(file, 'utf8').includes('android:scheme="com.creatorbooth.app"')) throw new Error('Manifest patch did not apply');
console.log('AndroidManifest.xml: sign-in return link registered');

// Android 13+ needs this permission declared before the app may ask to show notifications.
{
  let x = fs.readFileSync(file, 'utf8');
  if (!x.includes('android.permission.POST_NOTIFICATIONS')) {
    x = x.replace('<application', '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n    <application');
    fs.writeFileSync(file, x);
  }
  if (!fs.readFileSync(file, 'utf8').includes('android.permission.POST_NOTIFICATIONS')) throw new Error('Notification permission patch did not apply');
  console.log('AndroidManifest.xml: notification permission declared');
}
