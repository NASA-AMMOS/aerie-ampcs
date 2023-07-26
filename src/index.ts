import { xml2js, type Options } from 'xml-js';

export function toNumber(val: string): number | null {
  const number = parseFloat(val);
  return isNaN(number) ? null : number;
}

export type NumericRange = { min: number; max: number };

export type FswCommandArgumentBoolean = {
  arg_type: 'boolean';
  bit_length: number | null;
  default_value: string | null;
  description: string;
  format: { false_str: string; true_str: string } | null;
  name: string;
};

export type FswCommandArgumentEnum = {
  arg_type: 'enum';
  bit_length: number | null;
  default_value: string | null;
  description: string;
  enum_name: string;
  name: string;
  range: string[] | null;
};

export type FswCommandArgumentFill = {
  arg_type: 'fill';
  description: string;
  name: string;
};

export type FswCommandArgumentFixedString = {
  arg_type: 'fixed_string';
  description: string;
  name: string;
};

export type FswCommandArgumentFloat = {
  arg_type: 'float';
  bit_length: number | null;
  default_value: number | null;
  description: string;
  name: string;
  range: NumericRange | null;
  units: string;
};

export type FswCommandArgumentInteger = {
  arg_type: 'integer';
  bit_length: number | null;
  default_value: number | null;
  description: string;
  name: string;
  range: NumericRange | null;
  units: string;
};

export type FswCommandArgumentNumeric = {
  arg_type: 'numeric';
  bit_length: number | null;
  default_value: number | null;
  description: string;
  name: string;
  range: NumericRange | null;
  type: 'float' | 'integer' | 'unsigned';
  units: string;
};

export type FswCommandArgumentRepeat = {
  arg_type: 'repeat';
  description: string;
  name: string;
  prefix_bit_length: number | null;
  repeat: FswCommandArgumentRepeatChild | null;
};

export type FswCommandArgumentRepeatChild = {
  argumentMap: FswCommandArgumentMap;
  arguments: FswCommandArgument[];
  min: number | null;
  max: number | null;
};

export type FswCommandArgumentTime = {
  arg_type: 'time';
  bit_length: number | null;
  default_value: string | number | null;
  description: string;
  name: string;
  units: string;
};

export type FswCommandArgumentUnsigned = {
  arg_type: 'unsigned';
  bit_length: number | null;
  default_value: number | null;
  description: string;
  name: string;
  range: NumericRange | null;
  units: string;
};

export type FswCommandArgumentVarString = {
  arg_type: 'var_string';
  default_value: string | null;
  description: string;
  name: string;
  prefix_bit_length: number | null;
  max_bit_length: number | null;
  valid_regex: string | null;
};

export type FswCommandArgument =
  | FswCommandArgumentBoolean
  | FswCommandArgumentEnum
  | FswCommandArgumentFill
  | FswCommandArgumentFixedString
  | FswCommandArgumentFloat
  | FswCommandArgumentInteger
  | FswCommandArgumentNumeric
  | FswCommandArgumentRepeat
  | FswCommandArgumentTime
  | FswCommandArgumentUnsigned
  | FswCommandArgumentVarString;

export type FswCommandArgumentMap = { [name: string]: FswCommandArgument };

export type Header = {
  mission_name: string;
  schema_version: string;
  spacecraft_id: string;
  version: string;
};

export type Enum = {
  name: string;
  values: EnumValue[];
};

export type EnumMap = { [name: string]: Enum };

export type EnumValue = {
  numeric: number | null;
  symbol: string;
};

export type FswCommand = {
  argumentMap: FswCommandArgumentMap;
  arguments: FswCommandArgument[];
  description: string;
  stem: string;
  type: 'fsw_command';
};

export type FswCommandMap = { [stem: string]: FswCommand };

export type HwCommand = {
  description: string;
  stem: string;
  type: 'hw_command';
};

export type HwCommandMap = { [stem: string]: HwCommand };

export type CommandDictionary = {
  enumMap: EnumMap;
  enums: Enum[];
  fswCommandMap: FswCommandMap;
  fswCommands: FswCommand[];
  header: Header;
  hwCommandMap: HwCommandMap;
  hwCommands: HwCommand[];
  id: string;
  path: string | null;
};

export function parseArguments(element: any): {
  commandArgumentMap: FswCommandArgumentMap;
  commandArguments: FswCommandArgument[];
} {
  const commandArgumentMap: FswCommandArgumentMap = {};
  const commandArguments: FswCommandArgument[] = [];

  if (element?.name === 'arguments' && element?.elements?.length) {
    for (const arg of element.elements) {
      const { name: argType } = arg;
      const { name } = arg.attributes;
      const argElements = arg?.elements || [];

      let description: string = '';
      let format: any = null;
      let range: any = null;
      let repeat: FswCommandArgumentRepeatChild | null = null;
      let valid_regex: string | null = null;

      // Arg Elements.
      for (const argElement of argElements) {
        // Boolean Format.
        if (argElement?.name === 'boolean_format') {
          if (argType === 'boolean_arg') {
            format = argElement.attributes;
          }
        }

        // Description.
        if (argElement?.name === 'description') {
          const [descriptionElement] = argElement.elements;
          const { type } = descriptionElement;
          description = descriptionElement[type];

          if (description === undefined) {
            console.log(
              'Unknown FSW command argument description type: ',
              argElement,
            );
            description = '';
          }
        }

        // Range of Values.
        if (argElement?.name === 'range_of_values') {
          if (argType === 'enum_arg') {
            const ranges = argElement.elements;
            range = ranges.map(({ attributes }) => attributes.min);
          } else if (
            argType === 'float_arg' ||
            argType === 'integer_arg' ||
            argType === 'numeric_arg' ||
            argType === 'unsigned_arg'
          ) {
            const [{ attributes }] = argElement.elements;
            if (attributes) {
              const min = parseFloat(attributes.min);
              const max = parseFloat(attributes.max);
              range = { min, max };
            }
          }
        }

        // Repeat.
        if (argElement?.name === 'repeat') {
          if (argType === 'repeat_arg') {
            const { attributes, elements: repeatElements } = argElement;
            const [repeatElement] = repeatElements;
            const { max, min } = attributes;
            const parsedArguments = parseArguments(repeatElement);
            const { commandArgumentMap, commandArguments } = parsedArguments;
            repeat = {
              argumentMap: commandArgumentMap,
              arguments: commandArguments,
              max: toNumber(max),
              min: toNumber(min),
            };
          }
        }

        // Valid Regex.
        if (argElement?.name === 'valid_regex') {
          if (argType === 'var_string_arg') {
            const [validRegexElement] = argElement.elements;
            const { type } = validRegexElement;
            valid_regex = validRegexElement[type];

            if (valid_regex === undefined) {
              console.log(
                'Unknown FSW command argument valid_regex type: ',
                argElement,
              );
              valid_regex = null;
            }
          }
        }
      }

      // Arg.
      if (argType === 'boolean_arg') {
        const { attributes: attrs } = arg;
        const { bit_length, default_value = null } = attrs;
        const booleanArg: FswCommandArgumentBoolean = {
          arg_type: 'boolean',
          bit_length: toNumber(bit_length),
          default_value,
          description,
          format,
          name,
        };
        commandArgumentMap[name] = booleanArg;
        commandArguments.push(booleanArg);
      } else if (argType === 'enum_arg') {
        const { attributes: attrs } = arg;
        const { bit_length, default_value = null, enum_name } = attrs;
        const enumArg: FswCommandArgumentEnum = {
          arg_type: 'enum',
          bit_length: toNumber(bit_length),
          default_value,
          description,
          enum_name,
          name,
          range,
        };
        commandArgumentMap[name] = enumArg;
        commandArguments.push(enumArg);
      } else if (argType === 'fill_arg') {
        const fillArg: FswCommandArgumentFill = {
          arg_type: 'fill',
          description,
          name,
        };
        commandArgumentMap[name] = fillArg;
        commandArguments.push(fillArg);
      } else if (argType === 'fixed_string_arg') {
        const fixedStringArg: FswCommandArgumentFixedString = {
          arg_type: 'fixed_string',
          description,
          name,
        };
        commandArgumentMap[name] = fixedStringArg;
        commandArguments.push(fixedStringArg);
      } else if (argType === 'float_arg') {
        const { attributes: attrs } = arg;
        const { bit_length, default_value, units } = attrs;
        const floatArg: FswCommandArgumentFloat = {
          arg_type: 'float',
          bit_length: toNumber(bit_length),
          default_value: toNumber(default_value),
          description,
          name,
          range,
          units,
        };
        commandArgumentMap[name] = floatArg;
        commandArguments.push(floatArg);
      } else if (argType === 'integer_arg') {
        const { attributes: attrs } = arg;
        const { bit_length, default_value, units } = attrs;
        const integerArg: FswCommandArgumentInteger = {
          arg_type: 'integer',
          bit_length: toNumber(bit_length),
          default_value: toNumber(default_value),
          description,
          name,
          range,
          units,
        };
        commandArgumentMap[name] = integerArg;
        commandArguments.push(integerArg);
      } else if (argType === 'numeric_arg') {
        const { attributes: attrs } = arg;
        const { bit_length, default_value, type, units } = attrs;
        const numericArg: FswCommandArgumentNumeric = {
          arg_type: 'numeric',
          bit_length: toNumber(bit_length),
          default_value: toNumber(default_value),
          description,
          name,
          type,
          range,
          units,
        };
        commandArgumentMap[name] = numericArg;
        commandArguments.push(numericArg);
      } else if (argType === 'repeat_arg') {
        const { attributes: attrs } = arg;
        const { prefix_bit_length } = attrs;
        const repeatArg: FswCommandArgumentRepeat = {
          arg_type: 'repeat',
          prefix_bit_length: toNumber(prefix_bit_length),
          description,
          name,
          repeat,
        };
        commandArgumentMap[name] = repeatArg;
        commandArguments.push(repeatArg);
      } else if (argType === 'time_arg') {
        const { attributes: attrs } = arg;
        const { bit_length, default_value = null, units } = attrs;
        const timeArg: FswCommandArgumentTime = {
          arg_type: 'time',
          bit_length: toNumber(bit_length),
          default_value,
          description,
          name,
          units,
        };
        commandArgumentMap[name] = timeArg;
        commandArguments.push(timeArg);
      } else if (argType === 'unsigned_arg') {
        const { attributes: attrs } = arg;
        const { bit_length, default_value, units } = attrs;
        const unsignedArg: FswCommandArgumentUnsigned = {
          arg_type: 'unsigned',
          bit_length: toNumber(bit_length),
          default_value: toNumber(default_value),
          description,
          name,
          range,
          units,
        };
        commandArgumentMap[name] = unsignedArg;
        commandArguments.push(unsignedArg);
      } else if (argType === 'var_string_arg') {
        const { attributes: attrs } = arg;
        const {
          default_value = null,
          prefix_bit_length,
          max_bit_length,
        } = attrs;
        const varStringArg: FswCommandArgumentVarString = {
          arg_type: 'var_string',
          default_value,
          description,
          max_bit_length: toNumber(max_bit_length),
          name,
          prefix_bit_length: toNumber(prefix_bit_length),
          valid_regex,
        };
        commandArgumentMap[name] = varStringArg;
        commandArguments.push(varStringArg);
      } else {
        console.log('Unknown FSW command argument type: ', arg);
      }
    }
  }

  return { commandArgumentMap, commandArguments };
}

export function parse(
  xml: string,
  path: string | null = null,
  options: Options.XML2JS = { ignoreComment: true },
): CommandDictionary {
  const { elements } = xml2js(xml, options);
  const [commandDictionary] = elements;

  const header: Header = {
    mission_name: '',
    schema_version: '',
    spacecraft_id: '',
    version: '',
  };
  const enumMap: EnumMap = {};
  const enums: Enum[] = [];
  const fswCommandMap: FswCommandMap = {};
  const fswCommands: FswCommand[] = [];
  const hwCommandMap: HwCommandMap = {};
  const hwCommands: HwCommand[] = [];

  if (
    commandDictionary?.name === 'command_dictionary' &&
    commandDictionary?.elements?.length
  ) {
    for (const commandDictionaryElement of commandDictionary.elements) {
      // Header.
      if (commandDictionaryElement?.name === 'header') {
        const { attributes } = commandDictionaryElement;
        header.mission_name = attributes.mission_name || '';
        header.schema_version = attributes.schema_version || '';
        header.spacecraft_id = attributes.spacecraft_id || '';
        header.version = attributes.version || '';
      }

      // Enum Definitions.
      if (
        commandDictionaryElement?.name === 'enum_definitions' &&
        commandDictionaryElement?.elements?.length
      ) {
        for (const enumTable of commandDictionaryElement.elements) {
          const { name = '' } = enumTable.attributes;
          const [{ elements: valueElements }] = enumTable.elements;
          const values: EnumValue[] = [];

          for (const valueElement of valueElements) {
            const { symbol = '', numeric = null } = valueElement.attributes;
            values.push({ symbol, numeric: toNumber(numeric) });
          }

          const enumeration: Enum = { name, values };
          enumMap[name] = enumeration;
          enums.push(enumeration);
        }
      }

      // Command Definitions.
      if (
        commandDictionaryElement?.name === 'command_definitions' &&
        commandDictionaryElement?.elements?.length
      ) {
        for (const command of commandDictionaryElement.elements) {
          // FSW Command.
          if (command.name === 'fsw_command') {
            const { stem: commandStem } = command.attributes;
            let commandArgumentMap: FswCommandArgumentMap = {};
            let commandArguments: FswCommandArgument[] = [];
            let commandDescription = '';

            for (const commandElement of command.elements) {
              // Arguments.
              if (
                commandElement?.name === 'arguments' &&
                commandElement?.elements?.length
              ) {
                const parsedArguments = parseArguments(commandElement);
                commandArgumentMap = parsedArguments.commandArgumentMap;
                commandArguments = parsedArguments.commandArguments;
              }

              // Description.
              if (commandElement?.name === 'description') {
                const [descriptionElement] = commandElement.elements;
                const { type } = descriptionElement;
                const description = descriptionElement[type];

                if (description !== undefined) {
                  commandDescription = description;
                } else {
                  console.log(
                    'Unknown FSW command description type: ',
                    commandElement,
                  );
                }
              }
            }

            const fswCommand: FswCommand = {
              argumentMap: commandArgumentMap,
              arguments: commandArguments,
              description: commandDescription,
              stem: commandStem,
              type: 'fsw_command',
            };
            fswCommandMap[commandStem] = fswCommand;
            fswCommands.push(fswCommand);
          }

          // HW Command.
          if (command.name === 'hw_command') {
            const { stem: commandStem } = command.attributes;
            let commandDescription = '';

            for (const commandElement of command.elements) {
              // Description.
              if (commandElement?.name === 'description') {
                const [descriptionElement] = commandElement.elements;
                const { type } = descriptionElement;
                const description = descriptionElement[type];

                if (description !== undefined) {
                  commandDescription = description;
                } else {
                  console.log(
                    'Unknown HW command description type: ',
                    commandElement,
                  );
                }
              }
            }

            const hwCommand: HwCommand = {
              description: commandDescription,
              stem: commandStem,
              type: 'hw_command',
            };
            hwCommandMap[commandStem] = hwCommand;
            hwCommands.push(hwCommand);
          }
        }
      }
    }
  }

  // Unique ID (construct with header data).
  const id = `${header.mission_name}-${header.version}-${header.schema_version}`;

  return {
    enumMap,
    enums,
    fswCommandMap,
    fswCommands,
    header,
    hwCommandMap,
    hwCommands,
    id,
    path,
  };
}
