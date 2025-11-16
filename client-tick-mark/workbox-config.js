module.exports = {
	globDirectory: 'out/',
	globPatterns: [
		'**/*.{jpg,png,ico,svg,json}'
	],
	swDest: 'out/sw.js',
	clientClaim: true,
	skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: "CacheFirst",
      options: { cacheName: "images", expiration: { maxEntries: 50 } },
    },
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: { cacheName: "http-cache", networkTimeoutSeconds: 5, expiration: { maxEntries: 200 } },
    },
  ],
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};






























