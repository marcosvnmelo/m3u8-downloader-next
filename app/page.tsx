'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import InputErrorMessage from '@/components/InputErrorMessage';
import { cn } from '@/lib/utils';
import {
  type FormSchemaInput,
  type FormSchemaOutput,
  formSchema,
} from './api/download/types';
import IconDownload from '~icons/radix-icons/download';
import IconUpdate from '~icons/radix-icons/update';
import IconCheckCircled from '~icons/radix-icons/check-circled';
import IconCrossCircled from '~icons/radix-icons/cross-circled';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Home() {
  //* hooks
  const {
    handleSubmit,
    formState: { errors, dirtyFields },
    register,
    watch,
    setValue,
  } = useForm<FormSchemaInput>({
    // @ts-expect-error zod new version is not compatible with react-hook-form
    resolver: zodResolver(formSchema),
    defaultValues: {
      playlistFile: '',
      headers: '',
    },
  });

  //* state
  const [buttonStatus, setButtonStatus] = useState<Status>('idle');

  //* computed
  const playlistFile = watch('playlistFile');

  const headers = watch('headers');

  const videoUrls = useMemo<string[]>(() => {
    return playlistFile.match(/https:\/\/.+?\.ts/gm)?.map(url => url) ?? [];
  }, [playlistFile]);

  const parsedHeaders = useMemo<Record<string, string>>(() => {
    const matchList = headers.match(/(.+?):\s(.+)/gm);

    if (!matchList) return {};

    return matchList.reduce((acc, cur) => {
      const [key, value] = cur.split(':\n');

      return {
        ...acc,
        [key.toLowerCase().replace(':', '')]: value,
      };
    }, {});
  }, [headers]);

  //* handlers
  const handleSetButtonStatus = useCallback((status: Status) => {
    setButtonStatus(status);

    if (status === 'success' || status === 'error')
      setTimeout(() => {
        setButtonStatus('idle');
      }, 3000);
  }, []);

  const downloadVideo = useCallback(
    (data: FormSchemaOutput) => {
      fetch('/api/download', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => {
        if (!res.ok) throw new Error(res.statusText);

        if (res.status !== 200) throw new Error('Something went wrong');

        const fileBits: Uint8Array[] = [];

        let hasError = false;

        res.body
          ?.pipeTo(
            new WritableStream<Uint8Array>({
              write(chunk) {
                if (!chunk) hasError = true;

                fileBits.push(chunk);
              },
              close() {
                if (hasError) {
                  handleSetButtonStatus('error');
                  return;
                }

                const file = new File(fileBits, 'video.mp4', {
                  type: 'video/mp4',
                });

                const url = window.URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'video.mp4';
                a.click();

                window.URL.revokeObjectURL(url);

                handleSetButtonStatus('success');
              },
            }),
          )
          .catch(() => {
            handleSetButtonStatus('error');
          });
      });
    },
    [handleSetButtonStatus],
  );

  const onSubmit = useCallback(
    (data: FormSchemaOutput) => {
      setButtonStatus('loading');

      downloadVideo(data);
    },
    [downloadVideo],
  );

  //* effects
  useEffect(() => {
    setButtonStatus('idle');
  }, [playlistFile, headers]);

  useEffect(() => {
    setValue('videoUrls', videoUrls, {
      shouldValidate: dirtyFields.playlistFile,
    });
  }, [setValue, dirtyFields, videoUrls]);

  useEffect(() => {
    setValue('parsedHeaders', parsedHeaders, {
      shouldValidate: dirtyFields.headers,
    });
  }, [setValue, dirtyFields, parsedHeaders]);

  //* render
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='playlistFile'>.m3u8 file content</Label>
          <Textarea
            id='playlistFile'
            className={cn(
              errors.playlistFile?.message && 'ring-1 ring-destructive',
            )}
            placeholder={`#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:4\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXTINF:4.004000,\nhttps://server.net/video0.ts\n#EXT-X-ENDLIST`}
            {...register('playlistFile')}
            rows={12}
          />
          {errors.playlistFile?.message && (
            <InputErrorMessage>{errors.playlistFile.message}</InputErrorMessage>
          )}
          {!errors.playlistFile?.message && errors.videoUrls?.message && (
            <InputErrorMessage>{errors.videoUrls?.message}</InputErrorMessage>
          )}
        </div>

        <div>
          <Label htmlFor='videoUrls'>Video URLs</Label>
          <Textarea
            id='videoUrls'
            name='videoUrls'
            value={videoUrls.join('\n')}
            readOnly
            disabled
            rows={12}
          />
        </div>

        <div>
          <Label htmlFor='headers'>Headers</Label>
          <Textarea
            id='headers'
            placeholder={`Referer:\nhttps://server.net/\nSec-Ch-Ua:\n"Microsoft Edge";v="119", "Chromium";v="119", "Not?A_Brand";v="24"\nSec-Ch-Ua-Mobile:\n?0\nSec-Ch-Ua-Platform:\n"Windows"\nUser-Agent:\nMozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.2109.1`}
            className={cn(errors.headers?.message && 'ring-1 ring-destructive')}
            value={headers}
            {...register('headers')}
            rows={12}
          />
          {errors.headers?.message && (
            <InputErrorMessage>{errors.headers.message}</InputErrorMessage>
          )}
          {!errors.headers?.message && errors.parsedHeaders?.message && (
            <InputErrorMessage>
              {/* @ts-expect-error incorrect type infer */}
              {errors.parsedHeaders.message}
            </InputErrorMessage>
          )}
        </div>

        <div>
          <Label htmlFor='parsedHeaders'>Parsed Headers</Label>
          <Textarea
            id='parsedHeaders'
            name='parsedHeaders'
            value={JSON.stringify(parsedHeaders, null, 4)}
            readOnly
            disabled
            rows={12}
          />
        </div>
      </div>

      <div className='mt-4 flex justify-center'>
        <Button type='submit' disabled={buttonStatus === 'loading'}>
          Download
          {buttonStatus === 'idle' && <IconDownload className='ml-2' />}
          {buttonStatus === 'loading' && (
            <IconUpdate className='ml-2 animate-spin' />
          )}
          {buttonStatus === 'success' && <IconCheckCircled className='ml-2' />}
          {buttonStatus === 'error' && <IconCrossCircled className='ml-2' />}
        </Button>
      </div>
    </form>
  );
}
