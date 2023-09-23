import * as z from 'zod';

export const apiSchema = z.object({
  videoUrls: z.array(z.string()).min(1, 'No video urls found'),
  parsedHeaders: z
    .record(z.string())
    .refine(value => Object.keys(value).length > 0, 'No headers found'),
});

export const formSchema = z
  .object({
    playlistFile: z.string().nonempty('File content is required'),
    headers: z.string().nonempty('File content headers is required'),
  })
  .merge(apiSchema)
  .transform(value => ({
    videoUrls: value.videoUrls,
    parsedHeaders: value.parsedHeaders,
  }));

export type FormSchemaInput = z.input<typeof formSchema>;
export type FormSchemaOutput = z.output<typeof formSchema>;
