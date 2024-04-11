import { Element, xml2js, type Options } from 'xml-js';

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
  spacecraft_ids: number[];
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

export type Parameter =
  | ParameterEnum
  | ParameterFloat
  | ParameterInteger
  | ParameterString
  | ParameterUnsigned;

type ParameterBase = {
  param_id: number;
  param_name: string;
  parameter_version: number | null;
  parameter_group: string;
  bit_length: number | null;
};

type ParameterNumber = Pick<
  FswCommandArgumentInteger,
  'default_value' | 'range' | 'units'
> &
  ParameterBase;

export type ParameterFloat = ParameterNumber & {
  param_type: 'float_param';
};

export type ParameterUnsigned = ParameterNumber & {
  param_type: 'unsigned_int_param';
};

export type ParameterInteger = ParameterNumber & {
  param_type: 'integer_param';
};

export type ParameterString = Omit<ParameterBase, 'bit_length'> &
  Pick<FswCommandArgumentVarString, 'default_value'> & {
    param_type: 'string_param';
    max_bit_length: number;
  };

export type ParameterEnum = ParameterBase &
  Pick<FswCommandArgumentEnum, 'default_value'> & {
    param_type: 'enum_param';
    enum_type: Enum;
    units: string;
  };

export type ParamMap = { [stem: string]: Parameter };

type ParameterGroup = {
  param_group_name: string;
  group_params_names: string[];
};

export type ParameterDictionary = Pick<
  CommandDictionary,
  'enumMap' | 'enums' | 'header' | 'id' | 'path'
> & {
  params: Parameter[];
  paramMap: ParamMap;
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

  let header: Header = {
    mission_name: '',
    schema_version: '',
    spacecraft_ids: [],
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
        header = parseHeader(commandDictionaryElement);
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

function parseHeader(headerElement): Header {
  const { attributes } = headerElement;
  let spacecraft_ids: Header['spacecraft_ids'] = [];
  if (attributes.spacecraft_id) {
    spacecraft_ids = [toNumber(attributes.spacecraft_id)!];
  } else {
    spacecraft_ids =
      headerElement?.elements
        .find(el => el.name === 'spacecraft_ids')
        ?.elements.filter(el => el.name === 'spacecraft_id')
        .map(el => toNumber(el.attributes.value)) ?? [];
  }
  return {
    mission_name: attributes.mission_name ?? '',
    schema_version: attributes.schema_version ?? '',
    spacecraft_ids,
    version: attributes.version ?? '',
  };
}

function parseEnum(enumTable): Enum {
  const { name = '' } = enumTable.attributes;
  const [{ elements: valueElements }] = enumTable.elements;
  const values: EnumValue[] = [];

  for (const valueElement of valueElements) {
    const { symbol = '', numeric = null } = valueElement.attributes;
    values.push({ symbol, numeric: toNumber(numeric) });
  }

  return { name, values };
}

function parseParam(
  paramElement: Element,
  enumMap: EnumMap,
  paramGroups: ParameterGroup[],
): Parameter | null {
  const { attributes: attrs } = paramElement;
  const param_id = toNumber(attrs?.param_id as string)!;
  const param_name = (attrs?.param_name as string) ?? '';
  const parameter_version = toNumber(attrs?.parameter_version as string);
  const units = (attrs?.units as string) ?? '';
  // not all parameters are in a group
  const parameter_group =
    paramGroups.find(group => group.group_params_names.includes(param_name))
      ?.param_group_name ?? '';
  let bit_length: ParameterBase['bit_length'] = null;
  let max_bit_length: ParameterString['max_bit_length'] = NaN;
  let enum_name: string | null = null;

  const paramBase = {
    param_id,
    param_name,
    parameter_group,
    parameter_version,
  };

  if (paramElement.elements && paramElement.elements.length) {
    let param_type = '';
    let range: null | NumericRange | string[] = null;
    for (const valueElement of paramElement.elements) {
      if (valueElement.name === 'parameter_type') {
        const paramTypeChild = valueElement.elements![0];
        param_type = paramTypeChild.name!;
        bit_length = toNumber(paramTypeChild.attributes?.bit_length as string);
        max_bit_length = toNumber(
          paramTypeChild.attributes?.max_bit_length as string,
        )!;
        if (param_type === 'enum_param') {
          enum_name = paramTypeChild.attributes?.enum_name as string;
        }

        for (const paramChildElement of paramTypeChild.elements ?? []) {
          if (paramChildElement.name === 'range_of_values') {
            if (
              param_type === 'enum_param' ||
              param_type === 'unsigned_int_param' ||
              param_type === 'integer_param' ||
              param_type === 'float_param'
            ) {
              const [{ attributes }] = paramChildElement.elements!;
              if (attributes) {
                const min = toNumber(attributes.min as string);
                const max = toNumber(attributes.max as string);
                if (min !== null && max !== null) {
                  range = { min, max };
                }
              }
            }
          }
        }
      }
    }
    if (
      param_type === 'unsigned_int_param' ||
      param_type === 'float_param' ||
      param_type === 'integer_param'
    ) {
      let default_value: ParameterNumber['default_value'] = null;
      for (const valueElement of paramElement.elements) {
        if (valueElement.name === 'default_value') {
          default_value = toNumber(valueElement?.elements![0].text as string)!;
        }
      }
      return {
        ...paramBase,
        bit_length,
        param_type,
        range,
        units,
        default_value,
      };
    } else if (param_type === 'string_param') {
      let default_value: ParameterString['default_value'] = null;
      for (const valueElement of paramElement.elements) {
        if (valueElement.name === 'default_value') {
          default_value = valueElement?.elements![0].text as string;
        }
      }
      return {
        ...paramBase,
        param_type,
        max_bit_length,
        default_value,
      };
    } else if (param_type === 'enum_param') {
      let default_value: string | null = null;
      let enum_type: Enum = enumMap[enum_name!];
      for (const valueElement of paramElement.elements) {
        if (valueElement.name === 'default_value') {
          const defaultValueSymbol = valueElement?.elements![0].text as string;
          default_value =
            (
              enum_type.values.find(
                ev => ev.symbol === defaultValueSymbol,
              ) as EnumValue
            )?.symbol ?? null;
        }
      }
      return {
        ...paramBase,
        bit_length,
        param_type,
        units,
        default_value,
        enum_type,
      };
    } else {
      console.log(`Unknown parameter type ${param_type}`);
    }
  }

  return null;
}

export function parseParameterDictionary(
  xml: string,
  path: string | null = null,
  options: Options.XML2JS = { ignoreComment: true },
): ParameterDictionary {
  const { elements } = xml2js(xml, options);
  const [parameterDictionary] = elements;

  let header: Header = {
    mission_name: '',
    schema_version: '',
    spacecraft_ids: [],
    version: '',
  };
  const enumMap: EnumMap = {};
  const enums: Enum[] = [];
  const params: Parameter[] = [];
  const paramMap: ParamMap = {};
  const paramGroups: ParameterGroup[] = [];

  if (
    parameterDictionary?.name === 'param-def' &&
    parameterDictionary?.elements?.length
  ) {
    for (const parameterDictionaryElement of parameterDictionary.elements) {
      // Header.
      if (parameterDictionaryElement?.name === 'header') {
        header = parseHeader(parameterDictionaryElement);
      }

      // Enum Definitions.
      if (
        parameterDictionaryElement?.name === 'enum_definitions' &&
        parameterDictionaryElement?.elements?.length
      ) {
        for (const enumTable of parameterDictionaryElement.elements) {
          const enumeration: Enum = parseEnum(enumTable);
          enumMap[enumeration.name] = enumeration;
          enums.push(enumeration);
        }
      }

      // Parameter Groups.
      if (
        parameterDictionaryElement?.name === 'parameter_groups' &&
        parameterDictionaryElement?.elements?.length
      ) {
        for (const parameterGroupElement of parameterDictionaryElement.elements) {
          if (
            parameterGroupElement?.name === 'parameter_group' &&
            parameterGroupElement?.elements?.length
          ) {
            const param_group_name =
              parameterGroupElement.attributes.param_group_name;
            const group_params_names: string[] = [];
            for (const group_params of parameterGroupElement.elements) {
              if (
                group_params.name === 'group_params' &&
                group_params?.elements?.length
              ) {
                for (const group_param of group_params.elements) {
                  const group_param_name = group_param.elements![0].text;
                  if (typeof group_param_name === 'string') {
                    group_params_names.push(group_param_name);
                  }
                }
              }
            }
            const paramGroup: ParameterGroup = {
              param_group_name,
              group_params_names,
            };
            paramGroups.push(paramGroup);
          }
        }
      }
    }

    for (const parameterDictionaryElement of parameterDictionary.elements) {
      // param
      if (parameterDictionaryElement?.name === 'param') {
        const param = parseParam(
          parameterDictionaryElement,
          enumMap,
          paramGroups,
        );
        if (param) {
          paramMap[param.param_name] = param;
          params.push(param);
        }
      }
    }
  }

  const id = `${header.mission_name}-${header.version}-${header.schema_version}`;
  return {
    id,
    enumMap,
    enums,
    path,
    header,
    params,
    paramMap,
  };
}
