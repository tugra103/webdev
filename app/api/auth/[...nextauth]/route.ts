import NextAuth from "next-auth";

const instance = process.env.MASTODON_INSTANCE!;

const handler = NextAuth({
  providers: [
    {
      id: "mastodon",
      name: "Mastodon",
      type: "oauth",
      authorization: {
        url: `${instance}/oauth/authorize`,
        params: { scope: "read:accounts" },
      },
      token: `${instance}/oauth/token`,
      userinfo: `${instance}/api/v1/accounts/verify_credentials`,
      clientId: process.env.MASTODON_CLIENT_ID,
      clientSecret: process.env.MASTODON_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.display_name || profile.username,
          email: profile.id, // Mastodon'da email yok, id kullan
          image: profile.avatar,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, profile }) {
  if (profile) {
    const mastodonProfile = profile as {
      id: string;
      username: string;
      avatar: string;
    };

    token.mastodonId = mastodonProfile.id;
    token.mastodonUsername = mastodonProfile.username;
    token.mastodonAvatar = mastodonProfile.avatar;
    // isNewUser falan yok artık
  }
  return token;
},
async session({ session, token }) {
  session.user.id = token.mastodonId as string;
  return session;
},
},
});

export { handler as GET, handler as POST };