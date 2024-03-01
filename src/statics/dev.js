/**
 * shelly-porssisahko
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * 
 * License: GNU Affero General Public License v3.0 
 * 
 * This file is loaded only during local development
 */
/** URL of the shelly */
URL = "http://192.168.68.100";

/** URL of the logic script */
URLS = `${URL}/script/1`;

/**
 * debug function that is printing to console only when DEV is active
 */
DBG = console.log.bind(window.console);

/**
 * Helper that is used for DBG calls to add caller information
 */
me = () => {
  let s = new Error().stack;
  if (s) {
    s = s.split(String.fromCharCode(10));
  }
  if (s.length > 0) {
    let str = "";
    if (s[4] && s[4].trim().split(" ")[1]) {
      str += `/${s[4].trim().split(" ")[1]}`;
    }
    if (s[3] && s[3].trim().split(" ")[1]) {
      str += `/${s[3].trim().split(" ")[1]}`;
    }
    if (s[2] && s[2].trim().split(" ")[1]) {
      str += `/${s[2].trim().split(" ")[1]}`;
    }
    return `${str}:`;
  }
  return `?:`;
};

/**
 * Adding an event listener so we will catch eval() script errors better
 */
window.addEventListener("error", (e) => console.error("Error at line:", e.lineno), false);

updateLoop();