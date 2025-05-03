import type Design from '@canvas/design';
import { createContext } from 'react';

const DesignContext = createContext<Design | null>(null);
export default DesignContext
