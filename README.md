![ci](https://github.com/NASA-AMMOS/aerie-ampcs/actions/workflows/ci.yml/badge.svg)

# @nasa-jpl/aerie-ampcs

This package contains utility functions to convert a standard XML AMPCS command dictionary to JavaScript.

## Install

```bash
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
    <header mission_name="" schema_version="" version="" />
    <command_definitions>
      ...
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
