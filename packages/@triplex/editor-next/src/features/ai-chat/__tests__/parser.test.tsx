/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { describe, expect, it } from "vitest";
import { StreamingXMLParser } from "../parser";

describe("StreamingXMLParser", () => {
  it("should parse a simple XML string", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk(
      "<ai_response><ai_message>hello</ai_message></ai_response>",
    );

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [
            {
              "attributes": {},
              "children": [],
              "isResolved": true,
              "name": "ai_message",
              "text": "hello",
              "type": "text",
            },
          ],
          "isResolved": true,
          "name": "ai_response",
          "text": "",
          "type": "text",
        },
      ]
    `);
  });

  it("should handle attributes with slashes in strings", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk(
      '<code_add path="/users/douges/file.tsx">console.log();</code_add>',
    );

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {
            "path": "/users/douges/file.tsx",
          },
          "children": [],
          "isResolved": true,
          "name": "code_add",
          "text": "console.log();",
          "type": "code",
        },
      ]
    `);
  });

  it("should parse a partial XML string", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk("<ai_response><ai_message>hello</ai_message>");

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [
            {
              "attributes": {},
              "children": [],
              "isResolved": true,
              "name": "ai_message",
              "text": "hello",
              "type": "text",
            },
          ],
          "isResolved": false,
          "name": "ai_response",
          "text": "",
          "type": "text",
        },
      ]
    `);
  });

  it("should parse a partial nested XML string", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk("<ai_response><ai_message>hello");

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [
            {
              "attributes": {},
              "children": [],
              "isResolved": false,
              "name": "ai_message",
              "text": "hello",
              "type": "text",
            },
          ],
          "isResolved": false,
          "name": "ai_response",
          "text": "",
          "type": "text",
        },
      ]
    `);
  });

  it("should collect attributes", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk(
      "<ai_response><mutations><code_add lineNumber={10}>hello</code_add>",
    );

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [
            {
              "attributes": {},
              "children": [
                {
                  "attributes": {
                    "lineNumber": 10,
                  },
                  "children": [],
                  "isResolved": true,
                  "name": "code_add",
                  "text": "hello",
                  "type": "code",
                },
              ],
              "isResolved": false,
              "name": "mutations",
              "text": "",
              "type": "text",
            },
          ],
          "isResolved": false,
          "name": "ai_response",
          "text": "",
          "type": "text",
        },
      ]
    `);
  });

  it("should parse when starting on a new line", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk(`
<ai_response>
  <mutations>
    <code_add lineNumber={1}>
      console.log();
    </code_add>
  </mutations> 
</ai_response>
`);

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [
            {
              "attributes": {},
              "children": [
                {
                  "attributes": {
                    "lineNumber": 1,
                  },
                  "children": [],
                  "isResolved": true,
                  "name": "code_add",
                  "text": "console.log();",
                  "type": "code",
                },
              ],
              "isResolved": true,
              "name": "mutations",
              "text": "",
              "type": "text",
            },
          ],
          "isResolved": true,
          "name": "ai_response",
          "text": "",
          "type": "text",
        },
      ]
    `);
  });

  it("should ignore partial attributes", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk("<ai_response><mutations><code_add lineNumber={1");

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [
            {
              "attributes": {},
              "children": [
                {
                  "attributes": {},
                  "children": [],
                  "isResolved": false,
                  "name": "code_add",
                  "text": "",
                  "type": "code",
                },
              ],
              "isResolved": false,
              "name": "mutations",
              "text": "",
              "type": "text",
            },
          ],
          "isResolved": false,
          "name": "ai_response",
          "text": "",
          "type": "text",
        },
      ]
    `);
  });

  it("should specially handle code prefixed tags", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk(
      "<ai_response><mutations><code_add lineNumber={1}><MyComponent />Hel</code_add>",
    );

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [
            {
              "attributes": {},
              "children": [
                {
                  "attributes": {
                    "lineNumber": 1,
                  },
                  "children": [],
                  "isResolved": true,
                  "name": "code_add",
                  "text": "<MyComponent />Hel",
                  "type": "code",
                },
              ],
              "isResolved": false,
              "name": "mutations",
              "text": "",
              "type": "text",
            },
          ],
          "isResolved": false,
          "name": "ai_response",
          "text": "",
          "type": "text",
        },
      ]
    `);
  });

  it("should not move unknown closing tags into partial text for code blocks", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk(
      "<ai_response><mutations><code_add lineNumber={1}><MyComponent />Hel</code_a",
    );

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [
            {
              "attributes": {},
              "children": [
                {
                  "attributes": {
                    "lineNumber": 1,
                  },
                  "children": [],
                  "isResolved": false,
                  "name": "code_add",
                  "text": "<MyComponent />Hel",
                  "type": "code",
                },
              ],
              "isResolved": false,
              "name": "mutations",
              "text": "",
              "type": "text",
            },
          ],
          "isResolved": false,
          "name": "ai_response",
          "text": "",
          "type": "text",
        },
      ]
    `);
  });

  it("should handle text with inline code blocks", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk(
      "<ai_message>hi `<Example></Example>` there</ai_message>",
    );

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [],
          "isResolved": true,
          "name": "ai_message",
          "text": "hi \`<Example></Example>\` there",
          "type": "text",
        },
      ]
    `);
  });

  it("should handle text with code blocks", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk(
      "<ai_message>hi ```\n<Example></Example>\n``` there</ai_message>",
    );

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [],
          "isResolved": true,
          "name": "ai_message",
          "text": "hi \`\`\`
      <Example></Example>
      \`\`\` there",
          "type": "text",
        },
      ]
    `);
  });

  it("should handle streaming chunks", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk("<user_message>make blue</user_message>");
    parser.processChunk("<");
    parser.processChunk("ai_response>");
    parser.processChunk("<ai_message>Sure, I can change the");
    parser.processChunk(
      " color of the plane to blue. I'll update the `meshBasicMaterial",
    );
    parser.processChunk(
      `\` prop to use the color blue.</ai_message><mutations><code_replace path="/Users/douges/projects/triplex`,
    );
    parser.processChunk(
      `-monorepo/examples/test-fixture/src/scene.tsx" fromLineNumber={16} toLineNumber={16}>`,
    );
    parser.processChunk(
      `<meshBasicMaterial color={"#0000ff"} visible={true} /></code_replace></mutations></ai_response>`,
    );

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [],
          "isResolved": true,
          "name": "user_message",
          "text": "make blue",
          "type": "text",
        },
        {
          "attributes": {},
          "children": [
            {
              "attributes": {},
              "children": [],
              "isResolved": true,
              "name": "ai_message",
              "text": "Sure, I can change the color of the plane to blue. I'll update the \`meshBasicMaterial\` prop to use the color blue.",
              "type": "text",
            },
            {
              "attributes": {},
              "children": [
                {
                  "attributes": {
                    "fromLineNumber": 16,
                    "path": "/Users/douges/projects/triplex-monorepo/examples/test-fixture/src/scene.tsx",
                    "toLineNumber": 16,
                  },
                  "children": [],
                  "isResolved": true,
                  "name": "code_replace",
                  "text": "<meshBasicMaterial color={"#0000ff"} visible={true} />",
                  "type": "code",
                },
              ],
              "isResolved": true,
              "name": "mutations",
              "text": "",
              "type": "text",
            },
          ],
          "isResolved": true,
          "name": "ai_response",
          "text": "",
          "type": "text",
        },
      ]
    `);
  });

  it("should handle more streaming chunks", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk(`
      <ai_response>
        <ai_message>Sure.</ai_message>
        <mutations>
          <code_add path="/src/scene.tsx" lineNumber={17}>
            <mesh position={[-2, 0, 0]}>
              <boxGeometry />
              <meshStandardMaterial color="red" />
            </mesh>
          </code_add>
        </mutations>
      </ai_response>
    `);

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [
            {
              "attributes": {},
              "children": [],
              "isResolved": true,
              "name": "ai_message",
              "text": "Sure.",
              "type": "text",
            },
            {
              "attributes": {},
              "children": [
                {
                  "attributes": {
                    "lineNumber": 17,
                    "path": "/src/scene.tsx",
                  },
                  "children": [],
                  "isResolved": true,
                  "name": "code_add",
                  "text": "<mesh position={[-2, 0, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="red" />
      </mesh>",
                  "type": "code",
                },
              ],
              "isResolved": true,
              "name": "mutations",
              "text": "",
              "type": "text",
            },
          ],
          "isResolved": true,
          "name": "ai_response",
          "text": "",
          "type": "text",
        },
      ]
    `);
  });

  it("should normalize indentation in code blocks", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk(`
      <code_add>
        <div>
          hello world
        </div>
      </code_add>
    `);

    expect(parser.toStructure()[0].text).toMatchInlineSnapshot(`
      "<div>
        hello world
      </div>"
    `);
  });

  it("should replace &lt; / &gt; with < > in responses", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk(`
      <code_add>
        <div>
          hello world
        &lt;/div&gt;
      </code_add>
    `);

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [],
          "isResolved": true,
          "name": "code_add",
          "text": "<div>
        hello world
      </div>",
          "type": "code",
        },
      ]
    `);
  });

  it("should massage invalid closing tags", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk(`
      <ai_response>
        <code_add>
          <div>
            hello world
          </div>
        <code_add>
      <ai_response>
    `);

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [
            {
              "attributes": {},
              "children": [],
              "isResolved": true,
              "name": "code_add",
              "text": "<div>
        hello world
      </div>",
              "type": "code",
            },
          ],
          "isResolved": true,
          "name": "ai_response",
          "text": "",
          "type": "text",
        },
      ]
    `);
  });

  it("should omit any content in root that are not tags", () => {
    const parser = new StreamingXMLParser();

    parser.processChunk(`
      \`\`\`xml
      <ai_response>
        <code_add>
          <div>
            hello world
          </div>
        <code_add>
      <ai_response>
      \`\`\`
    `);

    expect(parser.toStructure()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "children": [
            {
              "attributes": {},
              "children": [],
              "isResolved": true,
              "name": "code_add",
              "text": "<div>
        hello world
      </div>",
              "type": "code",
            },
          ],
          "isResolved": true,
          "name": "ai_response",
          "text": "",
          "type": "text",
        },
      ]
    `);
  });
});
