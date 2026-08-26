export function toPublicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    preferences: {
      roles: user.preferences?.roles ?? [],
      locations: user.preferences?.locations ?? [],
      experienceLevels: user.preferences?.experienceLevels ?? [],
      skills: user.preferences?.skills ?? [],
      companies: user.preferences?.companies ?? [],
    },
  };
}
