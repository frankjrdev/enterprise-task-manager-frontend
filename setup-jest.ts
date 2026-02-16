import 'zone.js';
import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

const definePropertyIfMissing = (
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor,
): void => {
  if (!Object.getOwnPropertyDescriptor(target, propertyKey)) {
    Object.defineProperty(target, propertyKey, descriptor);
  }
};

// First, initialize the Angular testing environment.
try {
  getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
} catch (error) {
  const message = error instanceof Error ? error.message : '';
  if (!message.includes('Cannot set base providers because it has already been called')) {
    throw error;
  }
}

// Window mocks
definePropertyIfMissing(window, 'CSS', { value: null });
definePropertyIfMissing(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance'],
    };
  },
});

definePropertyIfMissing(document, 'doctype', {
  value: '<!DOCTYPE html>',
});

definePropertyIfMissing(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
  configurable: true,
});
