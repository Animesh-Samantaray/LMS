export const stickerPacks = [
  {
    id: 'reactions',
    name: 'Reactions',
    icon: '⚡',
    stickers: [
      { id: 'thumbs_up', emoji: '👍', label: 'Great Job', bg: 'from-amber-400 to-orange-500' },
      { id: 'fire', emoji: '🔥', label: 'On Fire', bg: 'from-rose-500 to-red-600' },
      { id: 'heart_sparkle', emoji: '💖', label: 'Love it', bg: 'from-pink-500 to-rose-500' },
      { id: 'mind_blown', emoji: '🤯', label: 'Mind Blown', bg: 'from-purple-500 to-indigo-600' },
      { id: 'clap', emoji: '👏', label: 'Well Done', bg: 'from-emerald-400 to-teal-600' },
      { id: 'rocket', emoji: '🚀', label: 'Speeding Up', bg: 'from-cyan-400 to-blue-600' },
    ],
  },
  {
    id: 'study',
    name: 'Study',
    icon: '📚',
    stickers: [
      { id: 'studying_hard', emoji: '📖', label: 'Deep Work', bg: 'from-blue-400 to-indigo-600' },
      { id: 'brain_power', emoji: '🧠', label: 'Thinking', bg: 'from-violet-400 to-purple-600' },
      { id: 'notes_ready', emoji: '📝', label: 'Notes Ready', bg: 'from-amber-400 to-yellow-600' },
      { id: 'bulb_moment', emoji: '💡', label: 'Eureka Idea', bg: 'from-yellow-300 to-amber-500' },
      { id: 'code_hacker', emoji: '💻', label: 'Coding Away', bg: 'from-cyan-500 to-teal-700' },
      { id: 'target_hit', emoji: '🎯', label: 'Goal Met', bg: 'from-red-400 to-pink-600' },
    ],
  },
  {
    id: 'celebration',
    name: 'Celebration',
    icon: '🎉',
    stickers: [
      { id: 'party_popper', emoji: '🎉', label: 'Congrats!', bg: 'from-amber-400 to-pink-500' },
      { id: 'trophy_win', emoji: '🏆', label: 'Champion', bg: 'from-yellow-400 to-amber-600' },
      { id: 'star_player', emoji: '⭐', label: 'Super Star', bg: 'from-yellow-300 to-orange-400' },
      { id: 'medal_gold', emoji: '🥇', label: '1st Place', bg: 'from-amber-300 to-yellow-500' },
      { id: 'cheers_drink', emoji: '🥂', label: 'Cheers Team', bg: 'from-emerald-400 to-teal-500' },
      { id: 'sparkles_glow', emoji: '✨', label: 'Shining Bright', bg: 'from-cyan-300 to-indigo-500' },
    ],
  },
  {
    id: 'emotions',
    name: 'Emotions',
    icon: '😊',
    stickers: [
      { id: 'smile_warm', emoji: '🥰', label: 'Heartwarming', bg: 'from-pink-400 to-rose-400' },
      { id: 'cool_sunglasses', emoji: '😎', label: 'Super Chill', bg: 'from-cyan-400 to-blue-500' },
      { id: 'sweat_smile', emoji: '😅', label: 'Phew Almost', bg: 'from-amber-300 to-yellow-400' },
      { id: 'hugs_love', emoji: '🤗', label: 'Big Hugs', bg: 'from-rose-400 to-pink-500' },
      { id: 'salute_respect', emoji: '🫡', label: 'Understood', bg: 'from-blue-400 to-indigo-500' },
      { id: 'focused_eyes', emoji: '🧐', label: 'Looking Closely', bg: 'from-violet-400 to-slate-600' },
    ],
  },
  {
    id: 'thanks',
    name: 'Thanks',
    icon: '🙏',
    stickers: [
      { id: 'folded_hands', emoji: '🙏', label: 'Thank You', bg: 'from-emerald-400 to-teal-600' },
      { id: 'flower_bouquet', emoji: '💐', label: 'Appreciate You', bg: 'from-rose-300 to-pink-600' },
      { id: 'handshake_deal', emoji: '🤝', label: 'Partnership', bg: 'from-blue-400 to-cyan-600' },
      { id: 'crown_mentor', emoji: '👑', label: 'Legend Mentor', bg: 'from-yellow-400 to-amber-500' },
      { id: 'tea_break', emoji: '☕', label: 'Break Time', bg: 'from-amber-600 to-orange-800' },
      { id: 'magic_wand', emoji: '🪄', label: 'Pure Magic', bg: 'from-indigo-400 to-purple-600' },
    ],
  },
];

export const findStickerById = (stickerId) => {
  for (const pack of stickerPacks) {
    const found = pack.stickers.find((s) => s.id === stickerId);
    if (found) return found;
  }
  return null;
};
