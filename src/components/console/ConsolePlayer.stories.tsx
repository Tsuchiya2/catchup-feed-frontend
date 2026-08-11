import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ConsolePlayer } from './ConsolePlayer';

/**
 * ConsolePlayer — 放送卓(改訂版)の音声プレイヤー。
 *
 * `src` が無い場合はヘアライン枠のみの縮退表示(等幅数値位置は `—`)。
 * `src` があれば再生/一時停止・シーク・localStorage への位置保存が有効になる。
 */
const meta = {
  title: 'Console/ConsolePlayer',
  component: ConsolePlayer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConsolePlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 縮退表示: エピソード音声 API が未接続の状態(`src` なし)。
 */
export const Degraded: Story = {
  args: {
    storageKey: 'storybook-degraded',
  },
};

/**
 * 音声ソースあり(URL はダミー。実環境ではエピソード mp3 の URL を渡す)。
 */
export const WithSource: Story = {
  args: {
    src: '/episode-sample.mp3',
    storageKey: 'storybook-with-source',
  },
};
