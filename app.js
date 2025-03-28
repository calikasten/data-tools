// Function to split text into sentences
function splitIntoSentences(text) {
  return text.match(/[^.!?]+[.!?]*/g) || [];
}

// Function to split text into tokens while preserving spaces
function tokenize(text) {
  return text.match(/(\s+|\w+|[^\w\s])/g) || [];
}

// Function to find the optimal alignment between two arrays
function findAlignment(arr1, arr2) {
  const m = arr1.length;
  const n = arr2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  // Fill dp array with longest common subsequence lengths
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find the alignment
  let i = m, j = n;
  const alignment = [];
  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      alignment.push({ old: arr1[i - 1], new: arr2[j - 1], match: true });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      alignment.push({ old: arr1[i - 1], new: '', match: false });
      i--;
    } else {
      alignment.push({ old: '', new: arr2[j - 1], match: false });
      j--;
    }
  }

  // Add remaining elements
  while (i > 0) alignment.push({ old: arr1[i - 1], new: '', match: false }), i--;
  while (j > 0) alignment.push({ old: '', new: arr2[j - 1], match: false }), j--;

  return alignment.reverse();
}

// Function to highlight differences based on alignment
function highlightDifferences(oldStr, newStr) {
  const oldTokens = tokenize(oldStr);
  const newTokens = tokenize(newStr);
  const alignment = findAlignment(oldTokens, newTokens);

  let resultOld = '';
  let resultNew = '';

  alignment.forEach(pair => {
    if (pair.match) {
      resultOld += `<span class="syntax-green">${pair.old}</span>`;
      resultNew += `<span class="syntax-green">${pair.new}</span>`;
    } else {
      resultOld += `<span class="syntax-orange">${pair.old}</span>`;
      resultNew += `<span class="syntax-orange">${pair.new}</span>`;
    }
  });

  return { old: resultOld, new: resultNew };
}

// Function to calculate the similarity between two strings
function calculateSimilarity(str1, str2) {
  const tokens1 = tokenize(str1);
  const tokens2 = tokenize(str2);
  const alignment = findAlignment(tokens1, tokens2);

  const matchCount = alignment.filter(pair => pair.match).length;
  const maxLength = Math.max(tokens1.length, tokens2.length);

  return matchCount / maxLength;
}

// Function to dynamically align sentences with a >50% similarity threshold
function dynamicSentenceAlignment(oldSentences, newSentences) {
  const usedNewSentences = new Set();
  const alignmentResults = [];

  oldSentences.forEach(oldSentence => {
    let bestMatch = '';
    let bestMatchIndex = -1;
    let bestSimilarity = 0;

    newSentences.forEach((newSentence, index) => {
      if (usedNewSentences.has(index)) return;

      const similarity = calculateSimilarity(oldSentence, newSentence);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = newSentence;
        bestMatchIndex = index;
      }
    });

    if (bestSimilarity > 0.5) {
      const diffResult = highlightDifferences(oldSentence, bestMatch);
      alignmentResults.push({ old: diffResult.old, new: diffResult.new });
      usedNewSentences.add(bestMatchIndex);
    } else {
      alignmentResults.push({ old: `<span class="syntax-orange">${oldSentence}</span>`, new: `<span class="syntax-orange"></span>` });
    }
  });

  newSentences.forEach((newSentence, index) => {
    if (!usedNewSentences.has(index)) {
      alignmentResults.push({ old: `<span class="syntax-orange"></span>`, new: `<span class="syntax-orange">${newSentence}</span>` });
    }
  });

  return alignmentResults;
}

// Example Input
const input = `Hello World. This is the old text.###Hello Earth. This is the new text.`;
const [oldText, newText] = input.split('###');

// Split old and new texts into sentences
const oldSentences = splitIntoSentences(oldText.trim());
const newSentences = splitIntoSentences(newText.trim());

// Align sentences dynamically
const alignmentResults = dynamicSentenceAlignment(oldSentences, newSentences);

// HTML content to display the old and new texts with differences highlighted
const htmlContent = `
  <table>
    <tr>
      <th>Text A</th>
      <th>Text B</th>
    </tr>
    ${alignmentResults.map(result => `
    <tr>
      <td>${result.old.trim()}</td>
      <td>${result.new.trim()}</td>
    </tr>`).join('')}
  </table>
`;

// Insert the comparison table into the div with id "comparison-table"
document.getElementById("comparison-table").innerHTML = htmlContent;
