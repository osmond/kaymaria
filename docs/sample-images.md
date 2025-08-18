# Sample Plant Images

Seed data uses photos sourced from [Unsplash](https://unsplash.com/) via the [Source API](https://source.unsplash.com/).
Each entry in `mock/plants.ts` points to a URL like:

```
https://source.unsplash.com/600x400/?snake-plant
```

The query portion (`snake-plant` above) corresponds to the plant's common name. Unsplash returns a real photograph matching the
query which is used as the placeholder image in development.

## Regenerating locally

If the images change or you need local copies, run the helper script:

```bash
npm run sample-images
```

This downloads the current Unsplash images into `public/sample-images/`. You can then upload them to your own
Supabase storage using `lib/storage.ts`'s `uploadPlantPhoto` function and replace the URLs in the seed files with the
returned public URLs.

