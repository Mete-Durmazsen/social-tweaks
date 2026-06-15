export interface FetchDislikesMessage {
  type: 'fetchDislikes';
  videoId: string;
}

export function isFetchDislikesMessage(message: unknown): message is FetchDislikesMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as Partial<FetchDislikesMessage>).type === 'fetchDislikes' &&
    typeof (message as Partial<FetchDislikesMessage>).videoId === 'string'
  );
}
