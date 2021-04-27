module.exports.prettyJoin = items => {
  if (items.length < 2) {
    return items[0] || ""
  }

  return `${items.slice(0, -1).join(", ")} & ${items.slice(-1)}`
}