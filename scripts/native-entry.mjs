// Bundled by prepare-www.mjs into www/vendor/native.js. Gives the plain-HTML app access to the
// real Capacitor plugins (the website never loads this file, so it stays a normal website).
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

window.NativeBridge = { Capacitor, CapacitorHttp, App, Browser, CapacitorUpdater };
