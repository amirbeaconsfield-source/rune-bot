export function rngPick(items, chanceKey = "chance") {
  const weighted = items.map((item) => {
    const chanceValue = Number(item[chanceKey]) || 0;
    const weight = chanceValue > 0 ? 1 / chanceValue : 0;

    return {
      item,
      weight,
    };
  });

  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) return null;

  let roll = Math.random() * totalWeight;
  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.item;
    }
  }

  return weighted[weighted.length - 1]?.item || null;
}
