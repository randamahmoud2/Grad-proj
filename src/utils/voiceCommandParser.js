// // Voice command parser for dental chart configuration
// export const parseVoiceCommand = (transcript, currentToothId = 18) => {
//   // Remove punctuation and normalize the command
//   const command = transcript.toLowerCase()
//     .replace(/[.,!?]/g, '')  // Remove punctuation
//     .trim();
  
//   // Handle "next" command to move to the next tooth
//   if (command === 'next' || command.includes('next tooth')) {
//     const teethSequence = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
//     const currentIndex = teethSequence.indexOf(currentToothId);
//     if (currentIndex !== -1 && currentIndex < teethSequence.length - 1) {
//       return {
//         type: 'next',
//         nextToothId: teethSequence[currentIndex + 1]
//       };
//     } else {
//       // If we're at the last tooth, provide feedback
//       return {
//         type: 'next',
//         nextToothId: null,
//         message: 'Already at the last tooth'
//       };
//     }
//   }

//   // Handle "previous" command to move to the previous tooth
//   if (command === 'previous' || command.includes('previous tooth')) {
//     const teethSequence = [18, 17, 16, 15, 14, 13, 12, 11];
//     const currentIndex = teethSequence.indexOf(currentToothId);
//     if (currentIndex > 0) {
//       return {
//         type: 'previous',
//         previousToothId: teethSequence[currentIndex - 1]
//       };
//     } else {
//       return {
//         type: 'previous',
//         previousToothId: null,
//         message: 'Already at the first tooth'
//       };
//     }
//   }

//   // Helper function to extract boolean value
//   const extractBoolean = (cmd) => {
//     // For implant commands, assume true unless explicitly negative
//     if (cmd.includes('implant')) {
//       const negativeWords = ['no', 'not', 'false', 'remove', 'delete', 'clear'];
//       return !negativeWords.some(word => cmd.includes(word));
//     }
//     return cmd.includes('true');
//   };

//   // Helper function to extract number value
//   const extractNumber = (cmd) => {
//     // First try to match digits
//     const matches = cmd.match(/(-?\d+)/);
//     if (matches) return parseInt(matches[1]);
    
//     // Then try to match number words
//     const numberWords = {
//       'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
//       'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
//     };
    
//     for (const [word, num] of Object.entries(numberWords)) {
//       if (cmd.includes(word)) return num;
//     }
    
//     return null;
//   };

//   // Helper function to extract multiple numbers
//   const extractNumbers = (cmd) => {
//     const matches = cmd.match(/(-?\d+)\s+(-?\d+)\s+(-?\d+)/);
//     if (matches) {
//       return [
//         parseInt(matches[1]),
//         parseInt(matches[2]),
//         parseInt(matches[3])
//       ];
//     }
//     return null;
//   };

//   // Parse different types of commands
//   if (command.includes('mobility')) {
//     const value = extractNumber(command);
//     if (value !== null) {
//       return {
//         toothId: currentToothId,
//         field: 'mobility',
//         value,
//         updateType: 'single'
//       };
//     }
//   }

//   if (command.includes('implant')) {
//     return {
//       toothId: currentToothId,
//       field: 'implant',
//       value: extractBoolean(command),
//       updateType: 'single'
//     };
//   }

//   if (command.includes('bleeding')) {
//     // Look for position indicators (a, b, c) - check for exact matches to avoid false positives
//     let position = null;
//     const words = command.split(' ');
//     for (let i = 0; i < words.length; i++) {
//       if (words[i] === 'a' || words[i] === 'b' || words[i] === 'c') {
//         position = words[i];
//         break;
//       }
//     }
    
//     if (position) {
//       return {
//         toothId: currentToothId,
//         field: 'bleed_on_probing',
//         position,
//         value: extractBoolean(command),
//         updateType: 'position'
//       };
//     }
//   }

//   if (command.includes('plaque')) {
//     // Look for position indicators (a, b, c) - check for exact matches to avoid false positives
//     let position = null;
//     const words = command.split(' ');
//     for (let i = 0; i < words.length; i++) {
//       if (words[i] === 'a' || words[i] === 'b' || words[i] === 'c') {
//         position = words[i];
//         break;
//       }
//     }
    
//     if (position) {
//       return {
//         toothId: currentToothId,
//         field: 'plaque',
//         position,
//         value: extractBoolean(command),
//         updateType: 'position'
//       };
//     }
//   }

//   if (command.includes('gingival depth') || command.includes('probing depth')) {
//     const field = command.includes('gingival') ? 'gingival_depth' : 'probing_depth';
    
//     // Check if it's a specific position command (e.g., "probing depth A is 2")
//     let position = null;
//     const words = command.split(' ');
//     for (let i = 0; i < words.length; i++) {
//       if (words[i] === 'a' || words[i] === 'b' || words[i] === 'c') {
//         position = words[i];
//         break;
//       }
//     }
    
//     if (position) {
//       const value = extractNumber(command);
//       if (value !== null) {
//         return {
//           toothId: currentToothId,
//           field,
//           position,
//           value,
//           updateType: 'position'
//         };
//       }
//     } else {
//       // Check for all positions format (e.g., "probing depth is 2 3 1")
//       const values = extractNumbers(command);
//       if (values) {
//         return {
//           toothId: currentToothId,
//           field,
//           values: {
//             a: values[0],
//             b: values[1],
//             c: values[2]
//           },
//           updateType: 'all_positions'
//         };
//       }
//     }
//   }

//   return null;
// }; 


// const TARGET_PHRASES = [
//   "mobility", 
//   "implant", 
//   "furcation", 
//   "bleeding on probing", 
//   "plaque",
//   "gingival depth",
//   "probing depth",
//   "teeth",
//   "tooth",
//   "true", 
//   "false", 
//   "one", 
//   "two", 
//   "three",
//   "four",
//   "five",
//   "six",
//   "seven",
//   "eight",
//   "nine",
//   "ten", 
//   "negative", 
//   "next", 
//   "jump to", 
//   "previous"
// ];

// // Simple Levenshtein distance
// function levenshtein(a, b) {
//   const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
//   for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
//   for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
//   for (let i = 1; i <= a.length; i++) {
//     for (let j = 1; j <= b.length; j++) {
//       const cost = a[i - 1] === b[j - 1] ? 0 : 1;
//       matrix[i][j] = Math.min(
//         matrix[i - 1][j] + 1, // deletion
//         matrix[i][j - 1] + 1, // insertion
//         matrix[i - 1][j - 1] + cost // substitution
//       );
//     }
//   }
//   return matrix[a.length][b.length];
// }

// function similarity(a, b) {
//   a = a.toLowerCase();
//   b = b.toLowerCase();
//   const longer = a.length > b.length ? a : b;
//   const shorter = a.length > b.length ? b : a;
//   if (longer.length === 0) return 1.0;
//   return (longer.length - levenshtein(longer, shorter)) / longer.length;
// }

// export function postProcessTranscript(transcript) {
//   // 1. Lowercase
//   let processed = transcript.toLowerCase();
//   // 2. Remove punctuation
//   processed = processed.replace(/[.,!?;:()\[\]{}"'`~@#$%^&*_+=<>\\/\\|-]/g, '');
//   // 3. Word similarity matching
//   // Try to match phrases first (longest first)
//   const sortedPhrases = [...TARGET_PHRASES].sort((a, b) => b.length - a.length);
//   for (const phrase of sortedPhrases) {
//     // Sliding window for multi-word phrases
//     const phraseWords = phrase.split(' ');
//     const words = processed.split(' ');
//     for (let i = 0; i <= words.length - phraseWords.length; i++) {
//       const window = words.slice(i, i + phraseWords.length).join(' ');
//       if (similarity(window, phrase) >= 0.7) {
//         // Replace the window with the target phrase
//         words.splice(i, phraseWords.length, phrase);
//         processed = words.join(' ');
//       }
//     }
//   }
//   // Now match single words
//   let words = processed.split(' ');
//   for (let i = 0; i < words.length; i++) {
//     let bestPhrase = null;
//     let bestScore = 0.7;
//     for (const phrase of TARGET_PHRASES) {
//       if (phrase.split(' ').length === 1) {
//         const score = similarity(words[i], phrase);
//         if (score >= bestScore) {
//           bestScore = score;
//           bestPhrase = phrase;
//         }
//       }
//     }
//     if (bestPhrase) words[i] = bestPhrase;
//   }
//   processed = words.join(' ');
//   return processed.trim();
// } 

// Voice command parser for dental chart configuration
export const parseVoiceCommand = (transcript, currentToothId = 18) => {
  const command = transcript.toLowerCase().trim();
  
  // Define teeth sequence
  const teethSequence = [18, 17, 16, 15, 14, 13, 12, 11];
  
  // Handle navigation commands
  if (command === 'next' || command === 'previous') {
    const currentIndex = teethSequence.indexOf(currentToothId);
    if (currentIndex !== -1) {
      if (command === 'next' && currentIndex < teethSequence.length - 1) {
        return {
          type: 'navigation',
          direction: 'next',
          nextToothId: teethSequence[currentIndex + 1],
          currentToothId: currentToothId
        };
      } else if (command === 'previous' && currentIndex > 0) {
        return {
          type: 'navigation',
          direction: 'previous',
          nextToothId: teethSequence[currentIndex - 1],
          currentToothId: currentToothId
        };
      } else {
        // Return a message when we're at the end or beginning
        return {
          type: 'navigation_limit',
          message: command === 'next' ? 
            `Already at last tooth (${currentToothId})` : 
            `Already at first tooth (${currentToothId})`
        };
      }
    }
    return null;
  }

  // Helper function to extract boolean value
  const extractBoolean = (cmd) => {
    return cmd.includes('true');
  };

  // Helper function to extract number value (supports both digits and words)
  const numberWords = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
  };
  const extractNumber = (cmd) => {
    const matches = cmd.match(/(-?\d+)/);
    if (matches) return parseInt(matches[1]);
    // Try to match number words
    for (const [word, num] of Object.entries(numberWords)) {
      if (cmd.includes(word)) return num;
    }
    return null;
  };

  // Helper function to extract multiple numbers
  const extractNumbers = (cmd) => {
    const matches = cmd.match(/(-?\d+)\s+(-?\d+)\s+(-?\d+)/);
    if (matches) {
      return [
        parseInt(matches[1]),
        parseInt(matches[2]),
        parseInt(matches[3])
      ];
    }
    return null;
  };

  // Parse different types of commands
  if (command.includes('mobility')) {
    const value = extractNumber(command);
    if (value !== null) {
      return {
        toothId: currentToothId,
        field: 'mobility',
        value,
        updateType: 'single'
      };
    }
  }

  if (command.includes('implant')) {
    return {
      toothId: currentToothId,
      field: 'implant',
      value: extractBoolean(command),
      updateType: 'single'
    };
  }

  if (command.includes('bleeding')) {
    const position = command.includes('a') ? 'a' : command.includes('b') ? 'b' : command.includes('c') ? 'c' : null;
    if (position) {
      return {
        toothId: currentToothId,
        field: 'bleed_on_probing',
        position,
        value: extractBoolean(command),
        updateType: 'position'
      };
    }
  }

  if (command.includes('plaque')) {
    const position = command.includes('a') ? 'a' : command.includes('b') ? 'b' : command.includes('c') ? 'c' : null;
    if (position) {
      return {
        toothId: currentToothId,
        field: 'plaque',
        position,
        value: extractBoolean(command),
        updateType: 'position'
      };
    }
  }

  if (command.includes('gingival depth') || command.includes('probing depth')) {
    const field = command.includes('gingival') ? 'gingival_depth' : 'probing_depth';
    
    // Check if it's a specific position command (e.g., "probing depth A is 2")
    const position = command.includes('a') ? 'a' : command.includes('b') ? 'b' : command.includes('c') ? 'c' : null;
    
    if (position) {
      const value = extractNumber(command);
      if (value !== null) {
        return {
          toothId: currentToothId,
          field,
          position,
          value,
          updateType: 'position'
        };
      }
    } else {
      // Check for all positions format (e.g., "probing depth is 2 3 1")
      const values = extractNumbers(command);
      if (values) {
        return {
          toothId: currentToothId,
          field,
          values: {
            a: values[0],
            b: values[1],
            c: values[2]
          },
          updateType: 'all_positions'
        };
      }
    }
  }

  return null;
};

// --- Post-processing for Whisper output ---
// Cleans, spell-corrects, and normalizes transcript for dental charting

// Normalization map for phonetically similar or misheard words
const NORMALIZATION_MAP = {
  "mobility": ["mobility", "mobilty", "mobility.", "mobility,", "mobilitys"],
  "implant": ["implant", "implants", "in plant", "in plan", "implent", "implan", "implant."],
  "furcation": ["furcation", "furcations", "furcation.", "furcation,"],
  "bleeding on probing": [
    "bleeding on probing", "bleeding probing", "bleeding and probing", "bleeding upon probing", "bleeding on propping"
  ],
  "plaque": ["plaque", "plack", "plaque.", "plaque,"],
  "gingival margin": ["gingival margin", "gingival margins", "gingival marjin", "gingival margin."],
  "probing depth": ["probing depth", "probing depths", "probing dept", "probing depth."],
  "teeth": ["teeth", "teath", "teeths"],
  "tooth": ["tooth", "toothe", "tooth."],
  "true": ["true", "tru", "trough", "truth"],
  "false": ["false", "falls", "force", "faulse"],
  "one": ["one", "won", "1"],
  "two": ["two", "to", "too", "2"],
  "three": ["three", "tree", "3"],
  "four": ["four", "for", "4"],
  "five": ["five", "fife", "5"],
  "six": ["six", "sex", "6"],
  "seven": ["seven", "sevan", "7"],
  "eight": ["eight", "ate", "8"],
  "nine": ["nine", "nighn", "9"],
  "ten": ["ten", "tin", "10"],
  "negative": ["negative", "negativ", "negitive"],
  "next": ["next", "nex", "next.","nxt"],
  "jump to": ["jump to", "jumpto", "jump too"],
  "previous": ["previous", "pervious", "previus", "previous."],
  "c": ["C","sea","see"],
  "b": ["B","bee"],
};

// Invert the normalization map for fast lookup
const TERM_LOOKUP = {};
for (const correct in NORMALIZATION_MAP) {
  for (const v of NORMALIZATION_MAP[correct]) {
    TERM_LOOKUP[v.toLowerCase()] = correct;
  }
}

// --- Similarity helpers ---
// Levenshtein distance
function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

// Similarity index (1 = identical, 0 = completely different)
function similarity(a, b) {
  if (!a.length && !b.length) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

// Basic cleaning: remove all punctuation, keep only letters, numbers, and spaces
function cleanText(text) {
  return text.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

// Basic spell correction (very simple, not context-aware)
function correctSpelling(text) {
  // For production, use a library. Here, just a placeholder (returns text as-is)
  // Optionally, integrate with a spellchecker if needed
  return text;
}

// --- Enhanced normalization: always map to closest phrase, including multi-word phrases ---
const TARGET_PHRASES = [
  "mobility",
  "implant",
  "furcation",
  "bleeding on probing",
  "plaque",
  "gingival depth",
  "probing depth",
  "teeth",
  "tooth",
  "true",
  "false",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "negative",
  "next",
  "jump to",
  "previous"
];

// Find the closest matching phrase in TARGET_PHRASES for a given n-gram
function bestPhraseMatch(ngram) {
  let bestScore = -1;
  let bestPhrase = TARGET_PHRASES[0];
  for (const phrase of TARGET_PHRASES) {
    const score = similarity(ngram, phrase);
    if (score > bestScore) {
      bestScore = score;
      bestPhrase = phrase;
    }
  }
  return { phrase: bestPhrase, score: bestScore };
}

// Normalize input by mapping to the closest phrase (multi-word aware) only if similarity > threshold
function normalizeTerms(text) {
  const words = text.split(' ');
  const maxPhraseLen = Math.max(...TARGET_PHRASES.map(p => p.split(' ').length));
  const normalized = [];
  let i = 0;
  const threshold = 0.7;
  while (i < words.length) {
    let best = { phrase: '', score: -1, len: 1 };
    // Try all n-grams up to maxPhraseLen
    for (let n = 1; n <= maxPhraseLen && i + n <= words.length; n++) {
      const ngram = words.slice(i, i + n).join(' ').toLowerCase();
      const match = bestPhraseMatch(ngram);
      if (match.score > best.score) {
        best = { phrase: match.phrase, score: match.score, len: n };
      }
    }
    if (best.score >= threshold) {
      normalized.push(best.phrase);
      i += best.len;
    } else {
      normalized.push(words[i]);
      i++;
    }
  }
  return normalized.join(' ');
}

// Main post-processing function
export function postProcessTranscript(text) {
  let cleaned = cleanText(text);
  let corrected = correctSpelling(cleaned);
  let normalized = normalizeTerms(corrected);
  return normalized;
} 