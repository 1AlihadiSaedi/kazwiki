/**
 * main.js – Application entry point
 * Mounts the Svelte App component to the DOM.
 */
import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, {
  target: document.getElementById('app'),
});

export default app;