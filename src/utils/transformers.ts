import { Buffer } from 'buffer'
import CryptoJS from 'crypto-js'
import jsyaml from 'js-yaml'

export interface TransformerResult {
  output: string;
  error?: string;
}

export type TransformerFn = (input: string, options?: any) => TransformerResult;

export interface Transformer {
  id: string;
  name: string;
  description: string;
  category: 'Encoding' | 'Formatting' | 'Hashing' | 'Utility';
  fn: TransformerFn;
}

export const transformers: Transformer[] = [
  // --- Encoding ---
  {
    id: 'base64-encode',
    name: 'Base64 Encode',
    description: 'Encode text to Base64 string',
    category: 'Encoding',
    fn: (input) => {
      try {
        return { output: Buffer.from(input, 'utf-8').toString('base64') };
      } catch (e) {
        return { output: input, error: 'Encoding failed' };
      }
    }
  },
  {
    id: 'base64-decode',
    name: 'Base64 Decode',
    description: 'Decode Base64 string to text',
    category: 'Encoding',
    fn: (input) => {
      try {
        let cleanInput = input.trim();
        if (cleanInput.includes('-') || cleanInput.includes('_')) {
          cleanInput = cleanInput.replace(/-/g, '+').replace(/_/g, '/');
          while (cleanInput.length % 4) cleanInput += '=';
        }
        return { output: Buffer.from(cleanInput, 'base64').toString('utf-8') };
      } catch (e) {
        return { output: input, error: 'Invalid Base64 input' };
      }
    }
  },
  {
    id: 'url-encode',
    name: 'URL Encode',
    description: 'Encode special characters for URLs',
    category: 'Encoding',
    fn: (input) => ({ output: encodeURIComponent(input) })
  },
  {
    id: 'url-decode',
    name: 'URL Decode',
    description: 'Decode URL-encoded characters',
    category: 'Encoding',
    fn: (input) => {
      try {
        return { output: decodeURIComponent(input) };
      } catch (e) {
        return { output: input, error: 'URL decoding failed' };
      }
    }
  },

  // --- Formatting ---
  {
    id: 'json-format',
    name: 'JSON Format',
    description: 'Prettify JSON with 2-space indentation',
    category: 'Formatting',
    fn: (input) => {
      try {
        if (!input.trim()) return { output: '' };
        const parsed = JSON.parse(input);
        return { output: JSON.stringify(parsed, null, 2) };
      } catch (e) {
        return { output: input, error: 'Invalid JSON' };
      }
    }
  },
  {
    id: 'json-minify',
    name: 'JSON Minify',
    description: 'Remove all whitespace from JSON',
    category: 'Formatting',
    fn: (input) => {
      try {
        if (!input.trim()) return { output: '' };
        const parsed = JSON.parse(input);
        return { output: JSON.stringify(parsed) };
      } catch (e) {
        return { output: input, error: 'Invalid JSON' };
      }
    }
  },
  {
    id: 'json-to-yaml',
    name: 'JSON to YAML',
    description: 'Convert JSON string to YAML',
    category: 'Formatting',
    fn: (input) => {
      try {
        if (!input.trim()) return { output: '' };
        const parsed = JSON.parse(input);
        return { output: jsyaml.dump(parsed) };
      } catch (e) {
        return { output: input, error: 'Invalid JSON input' };
      }
    }
  },
  {
    id: 'yaml-to-json',
    name: 'YAML to JSON',
    description: 'Convert YAML string to JSON',
    category: 'Formatting',
    fn: (input) => {
      try {
        if (!input.trim()) return { output: '' };
        const parsed = jsyaml.load(input);
        return { output: JSON.stringify(parsed, null, 2) };
      } catch (e) {
        return { output: input, error: 'Invalid YAML input' };
      }
    }
  },

  // --- Hashing ---
  {
    id: 'hash-md5',
    name: 'MD5 Hash',
    description: 'Generate MD5 message digest',
    category: 'Hashing',
    fn: (input) => ({ output: CryptoJS.MD5(input).toString() })
  },
  {
    id: 'hash-sha256',
    name: 'SHA-256 Hash',
    description: 'Generate SHA-256 secure hash',
    category: 'Hashing',
    fn: (input) => ({ output: CryptoJS.SHA256(input).toString() })
  },
  {
    id: 'hash-sha512',
    name: 'SHA-512 Hash',
    description: 'Generate SHA-512 secure hash',
    category: 'Hashing',
    fn: (input) => ({ output: CryptoJS.SHA512(input).toString() })
  },

  // --- Utility ---
  {
    id: 'text-uppercase',
    name: 'Uppercase',
    description: 'Convert text to ALL CAPS',
    category: 'Utility',
    fn: (input) => ({ output: input.toUpperCase() })
  },
  {
    id: 'text-lowercase',
    name: 'Lowercase',
    description: 'Convert text to lower case',
    category: 'Utility',
    fn: (input) => ({ output: input.toLowerCase() })
  },
  {
    id: 'text-trim',
    name: 'Trim',
    description: 'Remove leading/trailing whitespace',
    category: 'Utility',
    fn: (input) => ({ output: input.trim() })
  }
];

export const getTransformerById = (id: string) => transformers.find(t => t.id === id);
