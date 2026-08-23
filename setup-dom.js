// setup-dom.js
import { Window } from "happy-dom";

const window = new Window();

// 1. Assign the basic window and document
global.window = window;
global.document = window.document;

// 2. VITAL: Copy all global classes (like SyntaxError, TypeError, etc.) 
// from Bun's global scope to the fake window. This stops the "undefined is not a constructor" crash.
Object.getOwnPropertyNames(global)
  .filter(prop => prop[0] === prop[0].toUpperCase()) // Get things like 'Error', 'HTMLElement'
  .forEach(prop => {
    if (typeof global[prop] === 'function' && !window[prop]) {
      window[prop] = global[prop];
    }
  });

// 3. Explicitly link the most common ones
global.Node = window.Node;
global.HTMLElement = window.HTMLElement;
global.HTMLSelectElement = window.HTMLSelectElement;
global.HTMLInputElement = window.HTMLInputElement;