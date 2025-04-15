const pieceNames: { [key: string]: string } = {
  N: "Knight",
  B: "Bishop",
  R: "Rook",
  Q: "Queen",
  K: "King",
};

export function formatMoveForSpeech(move: string): string {
  let formatted = move.trim();

  if (formatted === "O-O") return "Castle Kingside";
  if (formatted === "O-O-O") return "Castle Queenside";

  const regex =
    /^([NBRQK])?([a-h]?[1-8]?)(x?)([a-h])([1-8])(=?[NBRQ])?([+#])?$/;
  const match = formatted.match(regex);

  if (match) {
    let parts: string[] = [];

    if (match[1]) {
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

    formatted = parts.join(" ");
  } else {
    formatted = formatted
      .replace(/([a-h])([1-8])/g, "$1 $2")
      .replace(/x/g, " takes ")
      .replace(/\+/g, " check")
      .replace(/#/g, " checkmate")
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  return formatted;
}
