import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// JSDOM does not implement scrolling; browser verification covers its visual effect.
vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

afterEach(cleanup);
