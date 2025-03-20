import fs from 'fs';
import emojiJsonData from 'emoji-datasource-google/emoji.json';

/**
 * Properties that are not required in the final emoji data.
 */
const UNNECESSARY_PROPERTIES = [
  'text',
  'texts',
  'sort_order',
  'added_in',
  'has_img_apple',
  'has_img_google',
  'has_img_twitter',
  'has_img_facebook',
  'has_img_messenger',
  'non_qualified',
  'docomo',
  'au',
  'softbank',
  'google',
];

/**
 * Converts a Unicode string (in hexadecimal format) to its corresponding UTF-16 character(s).
 *
 * For composite emojis (e.g. flags or those with skin-tone modifiers) that are represented
 * with multiple code points separated by a hyphen, this function processes each code point separately.
 *
 * @param {string} unicode - The Unicode string in hexadecimal format (e.g., "1F600" or "1F9D1-200D-1F373").
 * @returns {string} The corresponding emoji character(s).
 *
 * @example
 * console.log(convertRawData("1F600"));       // Outputs: 😀
 * console.log(convertRawData("1F9D1-200D-1F373"));   // Outputs: 🧑‍🍳
 */
function convertRawData(unicode: string): string {
  if (unicode.indexOf('-') > -1) {
    // For composite unicode strings, split into individual parts.
    const characters: string[] = [];
    const parts = unicode.split('-');

    for (const part of parts) {
      const codePoint = parseInt(part, 16);
      characters.push(handleHexCode(codePoint));
    }

    return characters.join('');
  } else {
    // For single unicode strings, convert directly.
    const codePoint = parseInt(unicode, 16);
    return handleHexCode(codePoint);
  }
}

/**
 * Converts a single Unicode code point into a UTF-16 encoded string.
 *
 * For code points in the supplementary range (0x10000 to 0x10FFFF), a surrogate pair is generated.
 * Otherwise, a single UTF-16 character is returned.
 *
 * @param {number} hex - The Unicode code point.
 * @returns {string} The UTF-16 encoded string.
 *
 * @example
 * console.log(handleHexCode(0x1F600)); // Outputs: 😀
 */
function handleHexCode(hex: number): string {
  if (hex >= 0x10000 && hex <= 0x10ffff) {
    const highSurrogate = Math.floor((hex - 0x10000) / 0x400) + 0xd800;
    const lowSurrogate = ((hex - 0x10000) % 0x400) + 0xdc00;
    return (
      String.fromCharCode(highSurrogate) + String.fromCharCode(lowSurrogate)
    );
  } else {
    return String.fromCharCode(hex);
  }
}

/**
 * Processes the raw emoji JSON data by:
 * 1. Sorting the emojis based on the 'sort_order' property.
 * 2. Converting the 'unified' Unicode field to its corresponding character(s) using convertRawData.
 * 3. Removing unnecessary properties from each emoji object.
 *
 * The processed emoji data is then written to 'src/emoji.json'.
 *
 * @returns {void}
 */
function updateEmojiData(): void {
  // Process and clean the emoji data
  const processedEmojis: any[] = emojiJsonData
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((emoji: any) => {
      // Convert the unified Unicode string to actual emoji characters.
      emoji.char = convertRawData(emoji.unified);

      // Remove properties that are not needed.
      for (const property in emoji) {
        if (UNNECESSARY_PROPERTIES.includes(property)) {
          delete emoji[property];
        }
      }
      return emoji;
    });

  // Remove existing file if it exists
  const outputPath = 'src/emoji.json';
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  // Write the processed emoji data to disk with pretty-printing.
  fs.writeFileSync(outputPath, JSON.stringify(processedEmojis, null, 2));
}

/**
 * The main entry point of the script.
 *
 * Calls updateEmojiData() to process the raw emoji data and save the cleaned data to disk.
 *
 * @returns {void}
 */
function main(): void {
  updateEmojiData();
}

// Execute the script.
main();
