import { deepStrictEqual } from 'assert';
import { parse } from '../dist/index.js';

describe('@nasa-jpl/aerie-ampcs', () => {
  describe('parse', () => {
    it('header', () => {
      const xml = `
        <?xml version='1.0' encoding='UTF-8'?>
        <!-- comment -->
        <command_dictionary>
          <!-- comment -->
          <header mission_name="GENERIC" spacecraft_id="42" schema_version="5.0" version="2022-001T00:00:00.000" />
        </command_dictionary>
      `;
      const path = '/bin/usr/command.xml';
      /** @type import('./index').CommandDictionary} */
      const expected = {
        enumMap: {},
        enums: [],
        fswCommandMap: {},
        fswCommands: [],
        header: {
          mission_name: 'GENERIC',
          schema_version: '5.0',
          spacecraft_id: '42',
          version: '2022-001T00:00:00.000',
        },
        hwCommandMap: {},
        hwCommands: [],
        id: 'GENERIC-2022-001T00:00:00.000-5.0',
        path,
      };
      const result = parse(xml, path);
      deepStrictEqual(result, expected);
    });

    it('enum_definitions', () => {
      const xml = `
        <?xml version='1.0' encoding='UTF-8'?>
        <!-- comment -->
        <command_dictionary>
          <enum_definitions>
            <!-- comment -->
            <enum_table name="SomeEnum">
              <values>
                <!-- comment -->
                <enum symbol="ON" numeric="1" />
                <!-- comment -->
                <enum symbol="OFF" numeric="0" />
              </values>
            </enum_table>
            <enum_table name="SomeOtherEnum">
            <!-- comment -->
              <values>
                <enum symbol="CLEAR_A" numeric="1"/>
                <enum symbol="CLEAR_B" numeric="2"/>
                <enum symbol="CLEAR_C" numeric="3"/>
              </values>
            </enum_table>
          </enum_definitions>
        </command_dictionary>
      `;
      /** @type import('./index').CommandDictionary} */
      const expected = {
        enumMap: {
          SomeEnum: {
            name: 'SomeEnum',
            values: [
              {
                symbol: 'ON',
                numeric: 1,
              },
              {
                symbol: 'OFF',
                numeric: 0,
              },
            ],
          },
          SomeOtherEnum: {
            name: 'SomeOtherEnum',
            values: [
              {
                symbol: 'CLEAR_A',
                numeric: 1,
              },
              {
                symbol: 'CLEAR_B',
                numeric: 2,
              },
              {
                symbol: 'CLEAR_C',
                numeric: 3,
              },
            ],
          },
        },
        enums: [
          {
            name: 'SomeEnum',
            values: [
              {
                symbol: 'ON',
                numeric: 1,
              },
              {
                symbol: 'OFF',
                numeric: 0,
              },
            ],
          },
          {
            name: 'SomeOtherEnum',
            values: [
              {
                symbol: 'CLEAR_A',
                numeric: 1,
              },
              {
                symbol: 'CLEAR_B',
                numeric: 2,
              },
              {
                symbol: 'CLEAR_C',
                numeric: 3,
              },
            ],
          },
        ],
        fswCommandMap: {},
        fswCommands: [],
        header: {
          mission_name: '',
          schema_version: '',
          spacecraft_id: '',
          version: '',
        },
        hwCommandMap: {},
        hwCommands: [],
        id: '--',
        path: null,
      };
      const result = parse(xml);
      deepStrictEqual(result, expected);
    });

    it('hw_commands', () => {
      const xml = `
        <?xml version='1.0' encoding='UTF-8'?>
        <command_dictionary>
          <command_definitions>
            <hw_command opcode="" stem="HDW_CMD_0">
              <!-- comment -->
              <categories>
                <!-- comment -->
                <category name="module" value="n/a" />
              </categories>
              <!-- comment -->
              <description><![CDATA[Does something interesting.]]></description>
              <!-- comment -->
            </hw_command>
            <hw_command opcode="" stem="HDW_CMD_1">
              <categories>
                <!-- comment -->
                <ops_category>ABC</ops_category>
              </categories>
              <description>Does something else interesting.</description>
            </hw_command>
          </command_definitions>
        </command_dictionary>
      `;
      /** @type import('./index').CommandDictionary} */
      const expected = {
        enumMap: {},
        enums: [],
        fswCommandMap: {},
        fswCommands: [],
        header: {
          mission_name: '',
          schema_version: '',
          spacecraft_id: '',
          version: '',
        },
        hwCommandMap: {
          HDW_CMD_0: {
            description: 'Does something interesting.',
            stem: 'HDW_CMD_0',
          },
          HDW_CMD_1: {
            description: 'Does something else interesting.',
            stem: 'HDW_CMD_1',
          },
        },
        hwCommands: [
          {
            description: 'Does something interesting.',
            stem: 'HDW_CMD_0',
          },
          {
            description: 'Does something else interesting.',
            stem: 'HDW_CMD_1',
          },
        ],
        id: '--',
        path: null,
      };
      const result = parse(xml);
      deepStrictEqual(result, expected);
    });

    it('fsw_command with numeric_arg, enum_arg, and boolean_arg', () => {
      const xml = `
        <?xml version='1.0' encoding='UTF-8'?>
        <command_dictionary>
          <command_definitions>
            <fsw_command opcode="" stem="FSW_CMD_0">
              <arguments>
                <!-- comment -->
                <enum_arg name="enum_arg_0" bit_length="8" enum_name="SomeEnum" default_value="ON" />
                <!-- comment -->
                <boolean_arg name="boolean_arg_0" bit_length="8" default_value="FALSE">
                  <!-- comment -->
                  <boolean_format true_str="TRUE" false_str="FALSE" />
                </boolean_arg>
                <numeric_arg name="numeric_arg_0" type="float" bit_length="64" units="none" default_value="1">
                  <!-- comment -->
                  <range_of_values>
                    <!-- comment -->
                    <include min="0.001" max="1.0001" />
                  </range_of_values>
                  <description>This is a description of numeric_arg_0</description>
                </numeric_arg>
              </arguments>
              <categories>
                <category name="cat" value="a" />
              </categories>
              <description><![CDATA[Does something interesting to the spacecraft.]]></description>
            </fsw_command>
          </command_definitions>
        </command_dictionary>
      `;
      /** @type import('./index').FswCommandArgumentMap} */
      const argumentMap = {
        enum_arg_0: {
          arg_type: 'enum',
          bit_length: 8,
          default_value: 'ON',
          description: '',
          enum_name: 'SomeEnum',
          name: 'enum_arg_0',
          range: null,
        },
        boolean_arg_0: {
          arg_type: 'boolean',
          bit_length: 8,
          default_value: 'FALSE',
          description: '',
          format: { true_str: 'TRUE', false_str: 'FALSE' },
          name: 'boolean_arg_0',
        },
        numeric_arg_0: {
          arg_type: 'numeric',
          bit_length: 64,
          default_value: 1,
          description: 'This is a description of numeric_arg_0',
          name: 'numeric_arg_0',
          type: 'float',
          range: { min: 0.001, max: 1.0001 },
          units: 'none',
        },
      };
      /** @type import('./index').FswCommandArgument[]} */
      const args = [
        {
          arg_type: 'enum',
          bit_length: 8,
          default_value: 'ON',
          description: '',
          enum_name: 'SomeEnum',
          name: 'enum_arg_0',
          range: null,
        },
        {
          arg_type: 'boolean',
          bit_length: 8,
          default_value: 'FALSE',
          description: '',
          format: { true_str: 'TRUE', false_str: 'FALSE' },
          name: 'boolean_arg_0',
        },
        {
          arg_type: 'numeric',
          bit_length: 64,
          default_value: 1,
          description: 'This is a description of numeric_arg_0',
          name: 'numeric_arg_0',
          type: 'float',
          range: { min: 0.001, max: 1.0001 },
          units: 'none',
        },
      ];
      /** @type import('./index').CommandDictionary} */
      const expected = {
        enumMap: {},
        enums: [],
        fswCommandMap: {
          FSW_CMD_0: {
            argumentMap,
            arguments: args,
            description: 'Does something interesting to the spacecraft.',
            stem: 'FSW_CMD_0',
          },
        },
        fswCommands: [
          {
            argumentMap,
            arguments: args,
            description: 'Does something interesting to the spacecraft.',
            stem: 'FSW_CMD_0',
          },
        ],
        header: {
          mission_name: '',
          schema_version: '',
          spacecraft_id: '',
          version: '',
        },
        hwCommandMap: {},
        hwCommands: [],
        id: '--',
        path: null,
      };
      const result = parse(xml);
      deepStrictEqual(result, expected);
    });

    it('fsw_command with float_arg, integer_arg, repeat_arg, time_arg, unsigned_arg and var_string_arg', () => {
      const xml = `
        <?xml version='1.0' encoding='UTF-8'?>
        <command_dictionary>
          <command_definitions>
            <fsw_command opcode="" stem="FSW_CMD_1" class="FSW">
              <arguments>
                <!-- comment -->
                <float_arg name="float_arg_0" bit_length="64" units="None">
                  <description>Some float argument.</description>
                </float_arg>
                <!-- comment -->
                <integer_arg name="integer_arg_0" bit_length="8" units="None">
                  <range_of_values>
                    <include min="-1" max="32"/>
                  </range_of_values>
                  <description>Some integer arg.</description>
                </integer_arg>
                <!-- comment -->
                <repeat_arg name="repeat_arg_0" prefix_bit_length="8">
                  <description>Some repeat argument.</description>
                  <repeat min="1" max="10">
                    <arguments>
                      <!-- comment -->
                      <enum_arg name="enum_arg_0" bit_length="8" enum_name="SomeEnum">
                        <description>Some repeated enum argument.</description>
                      </enum_arg>
                      <!-- comment -->
                      <unsigned_arg name="unsigned_arg_0" bit_length="16" units="index">
                        <range_of_values>
                          <include min="0" max="3999"/>
                        </range_of_values>
                        <description>Some repeated unsigned argument.</description>
                      </unsigned_arg>
                    </arguments>
                  </repeat>
                </repeat_arg>
                <!-- comment -->
                <time_arg name="time_arg_0" bit_length="32" units="SCLK">
                  <description><![CDATA[Some time argument.]]></description>
                </time_arg>
                <unsigned_arg name="unsigned_arg_0" bit_length="16" units="METER" default_value="2000">
                  <range_of_values>
                    <include min="1" max="2039"/>
                  </range_of_values>
                  <description>Some unsigned argument.</description>
                </unsigned_arg>
                <var_string_arg name="var_string_arg_0" prefix_bit_length="8" max_bit_length="1024">
                  <valid_regex><![CDATA[[0-9a-fxA-FX]{4,}]]></valid_regex>
                  <description>Some var string argument.</description>
                </var_string_arg>
              </arguments>
              <description>This command does something interesting.</description>
            </fsw_command>
          </command_definitions>
        </command_dictionary>
      `;
      /** @type import('./index').FswCommandArgumentMap} */
      const argumentMap = {
        float_arg_0: {
          arg_type: 'float',
          bit_length: 64,
          default_value: null,
          description: 'Some float argument.',
          name: 'float_arg_0',
          range: null,
          units: 'None',
        },
        integer_arg_0: {
          arg_type: 'integer',
          bit_length: 8,
          default_value: null,
          description: 'Some integer arg.',
          name: 'integer_arg_0',
          range: { min: -1, max: 32 },
          units: 'None',
        },
        repeat_arg_0: {
          arg_type: 'repeat',
          description: 'Some repeat argument.',
          name: 'repeat_arg_0',
          prefix_bit_length: 8,
          repeat: {
            argumentMap: {
              enum_arg_0: {
                arg_type: 'enum',
                bit_length: 8,
                default_value: null,
                description: 'Some repeated enum argument.',
                enum_name: 'SomeEnum',
                name: 'enum_arg_0',
                range: null,
              },
              unsigned_arg_0: {
                arg_type: 'unsigned',
                bit_length: 16,
                default_value: null,
                description: 'Some repeated unsigned argument.',
                name: 'unsigned_arg_0',
                range: { min: 0, max: 3999 },
                units: 'index',
              },
            },
            arguments: [
              {
                arg_type: 'enum',
                bit_length: 8,
                default_value: null,
                description: 'Some repeated enum argument.',
                enum_name: 'SomeEnum',
                name: 'enum_arg_0',
                range: null,
              },
              {
                arg_type: 'unsigned',
                bit_length: 16,
                default_value: null,
                description: 'Some repeated unsigned argument.',
                name: 'unsigned_arg_0',
                range: { min: 0, max: 3999 },
                units: 'index',
              },
            ],
            max: 10,
            min: 1,
          },
        },
        time_arg_0: {
          arg_type: 'time',
          bit_length: 32,
          default_value: null,
          description: 'Some time argument.',
          name: 'time_arg_0',
          units: 'SCLK',
        },
        unsigned_arg_0: {
          arg_type: 'unsigned',
          bit_length: 16,
          default_value: 2000,
          description: 'Some unsigned argument.',
          name: 'unsigned_arg_0',
          range: { min: 1, max: 2039 },
          units: 'METER',
        },
        var_string_arg_0: {
          arg_type: 'var_string',
          default_value: null,
          description: 'Some var string argument.',
          max_bit_length: 1024,
          prefix_bit_length: 8,
          name: 'var_string_arg_0',
          valid_regex: '[0-9a-fxA-FX]{4,}',
        },
      };
      /** @type import('./index').FswCommandArgument[]} */
      const args = [
        {
          arg_type: 'float',
          bit_length: 64,
          default_value: null,
          description: 'Some float argument.',
          name: 'float_arg_0',
          range: null,
          units: 'None',
        },
        {
          arg_type: 'integer',
          bit_length: 8,
          default_value: null,
          description: 'Some integer arg.',
          name: 'integer_arg_0',
          range: { min: -1, max: 32 },
          units: 'None',
        },
        {
          arg_type: 'repeat',
          description: 'Some repeat argument.',
          name: 'repeat_arg_0',
          prefix_bit_length: 8,
          repeat: {
            argumentMap: {
              enum_arg_0: {
                arg_type: 'enum',
                bit_length: 8,
                default_value: null,
                description: 'Some repeated enum argument.',
                enum_name: 'SomeEnum',
                name: 'enum_arg_0',
                range: null,
              },
              unsigned_arg_0: {
                arg_type: 'unsigned',
                bit_length: 16,
                default_value: null,
                description: 'Some repeated unsigned argument.',
                name: 'unsigned_arg_0',
                range: { min: 0, max: 3999 },
                units: 'index',
              },
            },
            arguments: [
              {
                arg_type: 'enum',
                bit_length: 8,
                default_value: null,
                description: 'Some repeated enum argument.',
                enum_name: 'SomeEnum',
                name: 'enum_arg_0',
                range: null,
              },
              {
                arg_type: 'unsigned',
                bit_length: 16,
                default_value: null,
                description: 'Some repeated unsigned argument.',
                name: 'unsigned_arg_0',
                range: { min: 0, max: 3999 },
                units: 'index',
              },
            ],
            max: 10,
            min: 1,
          },
        },
        {
          arg_type: 'time',
          bit_length: 32,
          default_value: null,
          description: 'Some time argument.',
          name: 'time_arg_0',
          units: 'SCLK',
        },
        {
          arg_type: 'unsigned',
          bit_length: 16,
          default_value: 2000,
          description: 'Some unsigned argument.',
          name: 'unsigned_arg_0',
          range: { min: 1, max: 2039 },
          units: 'METER',
        },
        {
          arg_type: 'var_string',
          default_value: null,
          description: 'Some var string argument.',
          max_bit_length: 1024,
          prefix_bit_length: 8,
          name: 'var_string_arg_0',
          valid_regex: '[0-9a-fxA-FX]{4,}',
        },
      ];
      /** @type import('./index').CommandDictionary} */
      const expected = {
        enumMap: {},
        enums: [],
        fswCommandMap: {
          FSW_CMD_1: {
            argumentMap,
            arguments: args,
            description: 'This command does something interesting.',
            stem: 'FSW_CMD_1',
          },
        },
        fswCommands: [
          {
            argumentMap,
            arguments: args,
            description: 'This command does something interesting.',
            stem: 'FSW_CMD_1',
          },
        ],
        header: {
          mission_name: '',
          schema_version: '',
          spacecraft_id: '',
          version: '',
        },
        hwCommandMap: {},
        hwCommands: [],
        id: '--',
        path: null,
      };
      const result = parse(xml);
      deepStrictEqual(result, expected);
    });

    it('header, enums, hw_commands, and fsw_commands', () => {
      const xml = `
        <?xml version='1.0' encoding='UTF-8'?>
        <command_dictionary>
          <header mission_name="GENERIC" spacecraft_id="42" schema_version="5.0" version="2022-001T00:00:00.000" />
          <enum_definitions>
            <enum_table name="SomeEnum">
              <values>
                <enum symbol="ON" numeric="1" />
                <enum symbol="OFF" numeric="0" />
              </values>
            </enum_table>
            <enum_table name="SomeOtherEnum">
              <values>
                <enum symbol="CLEAR_A" numeric="1"/>
                <enum symbol="CLEAR_B" numeric="2"/>
                <enum symbol="CLEAR_C" numeric="3"/>
              </values>
            </enum_table>
          </enum_definitions>
          <command_definitions>
            <hw_command opcode="" stem="HDW_CMD_0">
              <categories>
                <category name="module" value="n/a" />
              </categories>
              <description><![CDATA[Does something interesting.]]></description>
            </hw_command>
            <hw_command opcode="" stem="HDW_CMD_1">
              <categories>
                <ops_category>ABC</ops_category>
              </categories>
              <description>Does something else interesting.</description>
            </hw_command>
            <fsw_command opcode="" stem="FSW_CMD_0">
              <arguments>
                <enum_arg name="enum_arg_0" bit_length="8" enum_name="SomeEnum" default_value="ON" />
                <boolean_arg name="boolean_arg_0" bit_length="8" default_value="FALSE">
                  <boolean_format true_str="TRUE" false_str="FALSE" />
                </boolean_arg>
                <numeric_arg name="numeric_arg_0" type="float" bit_length="64" units="none" default_value="1">
                  <range_of_values>
                    <include min="0.001" max="1.0001" />
                  </range_of_values>
                  <description>This is a description of numeric_arg_0</description>
                </numeric_arg>
              </arguments>
              <categories>
                <category name="cat" value="a" />
              </categories>
              <description><![CDATA[Does something interesting to the spacecraft.]]></description>
            </fsw_command>
            <fsw_command opcode="" stem="FSW_CMD_1" class="FSW">
              <arguments>
                <float_arg name="float_arg_0" bit_length="64" units="None">
                  <description>Some float argument.</description>
                </float_arg>
                <integer_arg name="integer_arg_0" bit_length="8" units="None">
                  <range_of_values>
                    <include min="-1" max="32"/>
                  </range_of_values>
                  <description>Some integer arg.</description>
                </integer_arg>
                <repeat_arg name="repeat_arg_0" prefix_bit_length="8">
                  <description>Some repeat argument.</description>
                  <repeat min="1" max="10">
                    <arguments>
                      <enum_arg name="enum_arg_0" bit_length="8" enum_name="SomeEnum">
                        <description>Some repeated enum argument.</description>
                      </enum_arg>
                      <unsigned_arg name="unsigned_arg_0" bit_length="16" units="index">
                        <range_of_values>
                          <include min="0" max="3999"/>
                        </range_of_values>
                        <description>Some repeated unsigned argument.</description>
                      </unsigned_arg>
                    </arguments>
                  </repeat>
                </repeat_arg>
                <time_arg name="time_arg_0" bit_length="32" units="SCLK">
                  <description><![CDATA[Some time argument.]]></description>
                </time_arg>
                <unsigned_arg name="unsigned_arg_0" bit_length="16" units="METER" default_value="2000">
                  <range_of_values>
                    <include min="1" max="2039"/>
                  </range_of_values>
                  <description>Some unsigned argument.</description>
                </unsigned_arg>
                <var_string_arg name="var_string_arg_0" prefix_bit_length="8" max_bit_length="1024">
                  <valid_regex><![CDATA[[0-9a-fxA-FX]{4,}]]></valid_regex>
                  <description>Some var string argument.</description>
                </var_string_arg>
              </arguments>
              <description>This command does something interesting.</description>
            </fsw_command>
          </command_definitions>
        </command_dictionary>
      `;

      /** @type import('./index').CommandDictionary} */
      const expected = {
        enumMap: {
          SomeEnum: {
            name: 'SomeEnum',
            values: [
              {
                symbol: 'ON',
                numeric: 1,
              },
              {
                symbol: 'OFF',
                numeric: 0,
              },
            ],
          },
          SomeOtherEnum: {
            name: 'SomeOtherEnum',
            values: [
              {
                symbol: 'CLEAR_A',
                numeric: 1,
              },
              {
                symbol: 'CLEAR_B',
                numeric: 2,
              },
              {
                symbol: 'CLEAR_C',
                numeric: 3,
              },
            ],
          },
        },
        enums: [
          {
            name: 'SomeEnum',
            values: [
              {
                symbol: 'ON',
                numeric: 1,
              },
              {
                symbol: 'OFF',
                numeric: 0,
              },
            ],
          },
          {
            name: 'SomeOtherEnum',
            values: [
              {
                symbol: 'CLEAR_A',
                numeric: 1,
              },
              {
                symbol: 'CLEAR_B',
                numeric: 2,
              },
              {
                symbol: 'CLEAR_C',
                numeric: 3,
              },
            ],
          },
        ],
        fswCommandMap: {
          FSW_CMD_0: {
            argumentMap: {
              enum_arg_0: {
                arg_type: 'enum',
                bit_length: 8,
                default_value: 'ON',
                description: '',
                enum_name: 'SomeEnum',
                name: 'enum_arg_0',
                range: null,
              },
              boolean_arg_0: {
                arg_type: 'boolean',
                bit_length: 8,
                default_value: 'FALSE',
                description: '',
                format: { true_str: 'TRUE', false_str: 'FALSE' },
                name: 'boolean_arg_0',
              },
              numeric_arg_0: {
                arg_type: 'numeric',
                bit_length: 64,
                default_value: 1,
                description: 'This is a description of numeric_arg_0',
                name: 'numeric_arg_0',
                type: 'float',
                range: { min: 0.001, max: 1.0001 },
                units: 'none',
              },
            },
            arguments: [
              {
                arg_type: 'enum',
                bit_length: 8,
                default_value: 'ON',
                description: '',
                enum_name: 'SomeEnum',
                name: 'enum_arg_0',
                range: null,
              },
              {
                arg_type: 'boolean',
                bit_length: 8,
                default_value: 'FALSE',
                description: '',
                format: { true_str: 'TRUE', false_str: 'FALSE' },
                name: 'boolean_arg_0',
              },
              {
                arg_type: 'numeric',
                bit_length: 64,
                default_value: 1,
                description: 'This is a description of numeric_arg_0',
                name: 'numeric_arg_0',
                type: 'float',
                range: { min: 0.001, max: 1.0001 },
                units: 'none',
              },
            ],
            description: 'Does something interesting to the spacecraft.',
            stem: 'FSW_CMD_0',
          },
          FSW_CMD_1: {
            argumentMap: {
              float_arg_0: {
                arg_type: 'float',
                bit_length: 64,
                default_value: null,
                description: 'Some float argument.',
                name: 'float_arg_0',
                range: null,
                units: 'None',
              },
              integer_arg_0: {
                arg_type: 'integer',
                bit_length: 8,
                default_value: null,
                description: 'Some integer arg.',
                name: 'integer_arg_0',
                range: { min: -1, max: 32 },
                units: 'None',
              },
              repeat_arg_0: {
                arg_type: 'repeat',
                description: 'Some repeat argument.',
                name: 'repeat_arg_0',
                prefix_bit_length: 8,
                repeat: {
                  argumentMap: {
                    enum_arg_0: {
                      arg_type: 'enum',
                      bit_length: 8,
                      default_value: null,
                      description: 'Some repeated enum argument.',
                      enum_name: 'SomeEnum',
                      name: 'enum_arg_0',
                      range: null,
                    },
                    unsigned_arg_0: {
                      arg_type: 'unsigned',
                      bit_length: 16,
                      default_value: null,
                      description: 'Some repeated unsigned argument.',
                      name: 'unsigned_arg_0',
                      range: { min: 0, max: 3999 },
                      units: 'index',
                    },
                  },
                  arguments: [
                    {
                      arg_type: 'enum',
                      bit_length: 8,
                      default_value: null,
                      description: 'Some repeated enum argument.',
                      enum_name: 'SomeEnum',
                      name: 'enum_arg_0',
                      range: null,
                    },
                    {
                      arg_type: 'unsigned',
                      bit_length: 16,
                      default_value: null,
                      description: 'Some repeated unsigned argument.',
                      name: 'unsigned_arg_0',
                      range: { min: 0, max: 3999 },
                      units: 'index',
                    },
                  ],
                  max: 10,
                  min: 1,
                },
              },
              time_arg_0: {
                arg_type: 'time',
                bit_length: 32,
                default_value: null,
                description: 'Some time argument.',
                name: 'time_arg_0',
                units: 'SCLK',
              },
              unsigned_arg_0: {
                arg_type: 'unsigned',
                bit_length: 16,
                default_value: 2000,
                description: 'Some unsigned argument.',
                name: 'unsigned_arg_0',
                range: { min: 1, max: 2039 },
                units: 'METER',
              },
              var_string_arg_0: {
                arg_type: 'var_string',
                default_value: null,
                description: 'Some var string argument.',
                max_bit_length: 1024,
                prefix_bit_length: 8,
                name: 'var_string_arg_0',
                valid_regex: '[0-9a-fxA-FX]{4,}',
              },
            },
            arguments: [
              {
                arg_type: 'float',
                bit_length: 64,
                default_value: null,
                description: 'Some float argument.',
                name: 'float_arg_0',
                range: null,
                units: 'None',
              },
              {
                arg_type: 'integer',
                bit_length: 8,
                default_value: null,
                description: 'Some integer arg.',
                name: 'integer_arg_0',
                range: { min: -1, max: 32 },
                units: 'None',
              },
              {
                arg_type: 'repeat',
                description: 'Some repeat argument.',
                name: 'repeat_arg_0',
                prefix_bit_length: 8,
                repeat: {
                  argumentMap: {
                    enum_arg_0: {
                      arg_type: 'enum',
                      bit_length: 8,
                      default_value: null,
                      description: 'Some repeated enum argument.',
                      enum_name: 'SomeEnum',
                      name: 'enum_arg_0',
                      range: null,
                    },
                    unsigned_arg_0: {
                      arg_type: 'unsigned',
                      bit_length: 16,
                      default_value: null,
                      description: 'Some repeated unsigned argument.',
                      name: 'unsigned_arg_0',
                      range: { min: 0, max: 3999 },
                      units: 'index',
                    },
                  },
                  arguments: [
                    {
                      arg_type: 'enum',
                      bit_length: 8,
                      default_value: null,
                      description: 'Some repeated enum argument.',
                      enum_name: 'SomeEnum',
                      name: 'enum_arg_0',
                      range: null,
                    },
                    {
                      arg_type: 'unsigned',
                      bit_length: 16,
                      default_value: null,
                      description: 'Some repeated unsigned argument.',
                      name: 'unsigned_arg_0',
                      range: { min: 0, max: 3999 },
                      units: 'index',
                    },
                  ],
                  max: 10,
                  min: 1,
                },
              },
              {
                arg_type: 'time',
                bit_length: 32,
                default_value: null,
                description: 'Some time argument.',
                name: 'time_arg_0',
                units: 'SCLK',
              },
              {
                arg_type: 'unsigned',
                bit_length: 16,
                default_value: 2000,
                description: 'Some unsigned argument.',
                name: 'unsigned_arg_0',
                range: { min: 1, max: 2039 },
                units: 'METER',
              },
              {
                arg_type: 'var_string',
                default_value: null,
                description: 'Some var string argument.',
                max_bit_length: 1024,
                prefix_bit_length: 8,
                name: 'var_string_arg_0',
                valid_regex: '[0-9a-fxA-FX]{4,}',
              },
            ],
            description: 'This command does something interesting.',
            stem: 'FSW_CMD_1',
          },
        },
        fswCommands: [
          {
            argumentMap: {
              enum_arg_0: {
                arg_type: 'enum',
                bit_length: 8,
                default_value: 'ON',
                description: '',
                enum_name: 'SomeEnum',
                name: 'enum_arg_0',
                range: null,
              },
              boolean_arg_0: {
                arg_type: 'boolean',
                bit_length: 8,
                default_value: 'FALSE',
                description: '',
                format: { true_str: 'TRUE', false_str: 'FALSE' },
                name: 'boolean_arg_0',
              },
              numeric_arg_0: {
                arg_type: 'numeric',
                bit_length: 64,
                default_value: 1,
                description: 'This is a description of numeric_arg_0',
                name: 'numeric_arg_0',
                type: 'float',
                range: { min: 0.001, max: 1.0001 },
                units: 'none',
              },
            },
            arguments: [
              {
                arg_type: 'enum',
                bit_length: 8,
                default_value: 'ON',
                description: '',
                enum_name: 'SomeEnum',
                name: 'enum_arg_0',
                range: null,
              },
              {
                arg_type: 'boolean',
                bit_length: 8,
                default_value: 'FALSE',
                description: '',
                format: { true_str: 'TRUE', false_str: 'FALSE' },
                name: 'boolean_arg_0',
              },
              {
                arg_type: 'numeric',
                bit_length: 64,
                default_value: 1,
                description: 'This is a description of numeric_arg_0',
                name: 'numeric_arg_0',
                type: 'float',
                range: { min: 0.001, max: 1.0001 },
                units: 'none',
              },
            ],
            description: 'Does something interesting to the spacecraft.',
            stem: 'FSW_CMD_0',
          },
          {
            argumentMap: {
              float_arg_0: {
                arg_type: 'float',
                bit_length: 64,
                default_value: null,
                description: 'Some float argument.',
                name: 'float_arg_0',
                range: null,
                units: 'None',
              },
              integer_arg_0: {
                arg_type: 'integer',
                bit_length: 8,
                default_value: null,
                description: 'Some integer arg.',
                name: 'integer_arg_0',
                range: { min: -1, max: 32 },
                units: 'None',
              },
              repeat_arg_0: {
                arg_type: 'repeat',
                description: 'Some repeat argument.',
                name: 'repeat_arg_0',
                prefix_bit_length: 8,
                repeat: {
                  argumentMap: {
                    enum_arg_0: {
                      arg_type: 'enum',
                      bit_length: 8,
                      default_value: null,
                      description: 'Some repeated enum argument.',
                      enum_name: 'SomeEnum',
                      name: 'enum_arg_0',
                      range: null,
                    },
                    unsigned_arg_0: {
                      arg_type: 'unsigned',
                      bit_length: 16,
                      default_value: null,
                      description: 'Some repeated unsigned argument.',
                      name: 'unsigned_arg_0',
                      range: { min: 0, max: 3999 },
                      units: 'index',
                    },
                  },
                  arguments: [
                    {
                      arg_type: 'enum',
                      bit_length: 8,
                      default_value: null,
                      description: 'Some repeated enum argument.',
                      enum_name: 'SomeEnum',
                      name: 'enum_arg_0',
                      range: null,
                    },
                    {
                      arg_type: 'unsigned',
                      bit_length: 16,
                      default_value: null,
                      description: 'Some repeated unsigned argument.',
                      name: 'unsigned_arg_0',
                      range: { min: 0, max: 3999 },
                      units: 'index',
                    },
                  ],
                  max: 10,
                  min: 1,
                },
              },
              time_arg_0: {
                arg_type: 'time',
                bit_length: 32,
                default_value: null,
                description: 'Some time argument.',
                name: 'time_arg_0',
                units: 'SCLK',
              },
              unsigned_arg_0: {
                arg_type: 'unsigned',
                bit_length: 16,
                default_value: 2000,
                description: 'Some unsigned argument.',
                name: 'unsigned_arg_0',
                range: { min: 1, max: 2039 },
                units: 'METER',
              },
              var_string_arg_0: {
                arg_type: 'var_string',
                default_value: null,
                description: 'Some var string argument.',
                max_bit_length: 1024,
                prefix_bit_length: 8,
                name: 'var_string_arg_0',
                valid_regex: '[0-9a-fxA-FX]{4,}',
              },
            },
            arguments: [
              {
                arg_type: 'float',
                bit_length: 64,
                default_value: null,
                description: 'Some float argument.',
                name: 'float_arg_0',
                range: null,
                units: 'None',
              },
              {
                arg_type: 'integer',
                bit_length: 8,
                default_value: null,
                description: 'Some integer arg.',
                name: 'integer_arg_0',
                range: { min: -1, max: 32 },
                units: 'None',
              },
              {
                arg_type: 'repeat',
                description: 'Some repeat argument.',
                name: 'repeat_arg_0',
                prefix_bit_length: 8,
                repeat: {
                  argumentMap: {
                    enum_arg_0: {
                      arg_type: 'enum',
                      bit_length: 8,
                      default_value: null,
                      description: 'Some repeated enum argument.',
                      enum_name: 'SomeEnum',
                      name: 'enum_arg_0',
                      range: null,
                    },
                    unsigned_arg_0: {
                      arg_type: 'unsigned',
                      bit_length: 16,
                      default_value: null,
                      description: 'Some repeated unsigned argument.',
                      name: 'unsigned_arg_0',
                      range: { min: 0, max: 3999 },
                      units: 'index',
                    },
                  },
                  arguments: [
                    {
                      arg_type: 'enum',
                      bit_length: 8,
                      default_value: null,
                      description: 'Some repeated enum argument.',
                      enum_name: 'SomeEnum',
                      name: 'enum_arg_0',
                      range: null,
                    },
                    {
                      arg_type: 'unsigned',
                      bit_length: 16,
                      default_value: null,
                      description: 'Some repeated unsigned argument.',
                      name: 'unsigned_arg_0',
                      range: { min: 0, max: 3999 },
                      units: 'index',
                    },
                  ],
                  max: 10,
                  min: 1,
                },
              },
              {
                arg_type: 'time',
                bit_length: 32,
                default_value: null,
                description: 'Some time argument.',
                name: 'time_arg_0',
                units: 'SCLK',
              },
              {
                arg_type: 'unsigned',
                bit_length: 16,
                default_value: 2000,
                description: 'Some unsigned argument.',
                name: 'unsigned_arg_0',
                range: { min: 1, max: 2039 },
                units: 'METER',
              },
              {
                arg_type: 'var_string',
                default_value: null,
                description: 'Some var string argument.',
                max_bit_length: 1024,
                prefix_bit_length: 8,
                name: 'var_string_arg_0',
                valid_regex: '[0-9a-fxA-FX]{4,}',
              },
            ],
            description: 'This command does something interesting.',
            stem: 'FSW_CMD_1',
          },
        ],
        header: {
          mission_name: 'GENERIC',
          schema_version: '5.0',
          spacecraft_id: '42',
          version: '2022-001T00:00:00.000',
        },
        hwCommandMap: {
          HDW_CMD_0: {
            description: 'Does something interesting.',
            stem: 'HDW_CMD_0',
          },
          HDW_CMD_1: {
            description: 'Does something else interesting.',
            stem: 'HDW_CMD_1',
          },
        },
        hwCommands: [
          {
            description: 'Does something interesting.',
            stem: 'HDW_CMD_0',
          },
          {
            description: 'Does something else interesting.',
            stem: 'HDW_CMD_1',
          },
        ],
        id: 'GENERIC-2022-001T00:00:00.000-5.0',
        path: null,
      };
      const result = parse(xml);
      deepStrictEqual(result, expected);
    });
  });
});
