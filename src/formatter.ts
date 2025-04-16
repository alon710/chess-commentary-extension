const pieceNames: { [key: string]: string } = {
  N: "Knight",
  B: "Bishop",
  R: "Rook",
  Q: "Queen",
  K: "King",
  P: "Pawn",
};

function formatSpecialNotations(text: string): string {
  text = text.replace(/^[NBRQK]/, "");

  return text
    .replace(/x/g, " takes ")
    .replace(/\+/g, " check")
    .replace(/#/g, " checkmate")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatMoveForSpeech(move: string): string {
  let formatted = move.trim();
  console.log("Input move:", formatted);

  const moveTextMatch = formatted.match(
    /<span class="node-highlight-content[^>]*>(?:<span[^>]*data-figurine="([NBRQK])"[^>]*>)?([^<]+)<\/span>/
  );
  console.log("Move text match:", moveTextMatch);

  if (moveTextMatch) {
    const pieceLetter = moveTextMatch[1];
    let moveText = moveTextMatch[2].trim();
    moveText = formatSpecialNotations(moveText);

    if (pieceLetter) {
      return `${pieceNames[pieceLetter]} ${moveText.toUpperCase()}`;
    } else {
      return `Pawn ${moveText.toUpperCase()}`;
    }
  }

  const figurineMatch = formatted.match(/data-figurine="([NBRQK])"/);
  console.log("Figurine match:", figurineMatch);

  if (figurineMatch) {
    const pieceLetter = figurineMatch[1];

    let moveText = formatted.split("</span>").pop()?.trim() || "";
    moveText = formatSpecialNotations(moveText);

    console.log("Piece letter:", pieceLetter, "Move text:", moveText);
    return `${pieceNames[pieceLetter]} ${moveText.toUpperCase()}`;
  }

  if (formatted === "O-O") return "King castles Kingside";
  if (formatted === "O-O-O") return "King castles Queenside";

  const regex =
    /^([NBRQK])?([a-h]?[1-8]?)(x?)([a-h])([1-8])(=?[NBRQ])?([+#])?$/;
  const match = formatted.match(regex);

  if (match) {
    let parts: string[] = [];

    if (!match[1]) {
      parts.push("Pawn");
    } else {
      const pieceLetter = match[1].toUpperCase();
      parts.push(pieceNames[pieceLetter] || pieceLetter);
    }

    if (match[2])
      parts.push(...match[2].split("").map((char) => char.toUpperCase()));

    if (match[3]) parts.push("takes");

    if (match[4]) parts.push(match[4].toUpperCase());

    if (match[5]) parts.push(match[5]);

    if (match[6]) {
      const promotedPieceLetter = match[6].substring(1).toUpperCase();
      parts.push("promotes to");
      parts.push(pieceNames[promotedPieceLetter] || promotedPieceLetter);
    }

    if (match[7] === "+") parts.push("check");
    if (match[7] === "#") parts.push("checkmate");

    return parts.join(" ");
  } else {
    return "Pawn " + formatSpecialNotations(formatted).toUpperCase();
  }
}
