[![npm version](https://img.shields.io/npm/v/@nasa-jpl/aerie-ampcs.svg)](https://www.npmjs.com/package/@nasa-jpl/aerie-ampcs)

# @nasa-jpl/aerie-ampcs

This package contains utility functions to convert a standard XML AMPCS command dictionary to JavaScript.

## Install

```sh
npm install @nasa-jpl/aerie-ampcs --save
```

## Usage

### `parse`

Parse an XML string in the AMPCS command dictionary standard into JavaScript.

```ts
import { parse } from '@nasa-jpl/aerie-ampcs';

const xml = `
  <?xml version='1.0' encoding='UTF-8'?>
  <command_dictionary>
    <header mission_name="GENERIC" spacecraft_id="42" schema_version="5.0" version="2022-001T00:00:00.000" />
    <command_definitions>
    </command_definitions>
  </command_dictionary>
`;

const js = parse(xml);
console.log(js);

const json = JSON.stringify(js);
console.log(json);
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
