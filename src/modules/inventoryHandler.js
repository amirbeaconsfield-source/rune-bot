import { User } from "../schemas/user.js";

export async function giveItem(userId, item) {
  let user = await User.findOne({ userID: userId });

  if (!user) {
    user = new User({
      userID: userId,
    });
  }

  user.inventory.push({
    ...item,
    obtainedAt: new Date(),
  });

  await user.save();
  return user;
}

export async function takeItem(userId, itemIndex) {
  const user = await User.findOne({ userID: userId });

  if (!user) {
    throw new Error("User not found");
  }

  if (itemIndex < 0 || itemIndex >= user.inventory.length) {
    throw new Error("Invalid item index");
  }

  const removedItem = user.inventory.splice(itemIndex, 1);
  await user.save();

  return removedItem[0];
}

export async function getInventory(userId) {
  const user = await User.findOne({ userID: userId });
  return user ? user.inventory : [];
}
