/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const WorldRegistry = {
  rooms: {
    FOYER: {
      name: 'Foyer',
      fullName: 'stately Foyer',
      description: 'The entrance hall with black tiled floor.',
      width: 800,
      height: 800,
      wallHitText: 'Oof! Stately black tiled wall hit! Stopped.',
      portalTexts: {
        GARDEN: 'Stepped through the north door into the bright, floral Garden!',
        PORCH: 'Stepped through the south door onto the peaceful Front Porch!',
        BACK: 'Backed back into the luxurious Foyer.'
      }
    },
    GARDEN: {
      name: 'Garden',
      fullName: 'bright, floral Garden',
      description: 'An outdoor area with grass and flowers.',
      width: 800,
      height: 800,
      wallHitText: 'Oof! Soft flower hedge hit! Stopped.',
      portalTexts: {
        FOYER: 'Stepped back into the luxurious Foyer.',
        BACK: 'Backed through the doorway into the spacious flower Garden!'
      }
    },
    PORCH: {
      name: 'Front Porch',
      fullName: 'peaceful Front Porch',
      description: 'A wooden porch with white columns.',
      width: 800,
      height: 200,
      wallHitText: 'Oof! Wooden railing hit! Stopped.',
      portalTexts: {
        FOYER: 'Stepped back into the luxurious Foyer.',
        TEMPLE: 'Ascended through the South Gate into the majestic Temple of Hayana!',
        BACK: 'Backed south onto the Front Porch!'
      }
    },
    TEMPLE: {
      name: 'Temple of Hayana',
      fullName: 'majestic Temple of Hayana',
      description: 'A sacred stone temple with echoing chambers.',
      width: 2000,
      height: 2000,
      wallHitText: 'Oof! Chiseled temple masonry wall hit! Stopped.',
      portalTexts: {
        PORCH: 'Stepped through the north gate onto the Front Porch!',
        BACK: 'Backed south into the majestic Temple of Hayana!'
      }
    }
  }
};
