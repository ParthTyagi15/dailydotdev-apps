import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { BOOKMARKS_FEED_QUERY, SEARCH_BOOKMARKS_QUERY } from '../graphql/feed';
import AuthContext from '../contexts/AuthContext';
import { CustomFeedHeader, FeedPage, FeedPageHeader } from './utilities';
import SearchEmptyScreen from './SearchEmptyScreen';
import Feed, { FeedProps } from './Feed';
import BookmarkEmptyScreen from './BookmarkEmptyScreen';
import { Button } from './buttons/Button';
import ShareIcon from './icons/Share';
import { generateQueryKey, RequestKey } from '../lib/query';

export type BookmarkFeedLayoutProps = {
  searchQuery?: string;
  children?: ReactNode;
  searchChildren: ReactNode;
  onSearchButtonClick?: () => unknown;
};

const SharedBookmarksModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "sharedBookmarksModal" */ './modals/SharedBookmarksModal'
    ),
);

export default function BookmarkFeedLayout({
  searchQuery,
  searchChildren,
  children,
}: BookmarkFeedLayoutProps): ReactElement {
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [showEmptyScreen, setShowEmptyScreen] = useState(false);
  const [showSharedBookmarks, setShowSharedBookmarks] = useState(false);
  const defaultKey = generateQueryKey(RequestKey.Bookmarks, user);
  const feedProps = useMemo<FeedProps<unknown>>(() => {
    if (searchQuery) {
      return {
        feedName: 'search-bookmarks',
        feedQueryKey: defaultKey.concat(searchQuery),
        query: SEARCH_BOOKMARKS_QUERY,
        variables: { query: searchQuery },
        emptyScreen: <SearchEmptyScreen />,
      };
    }
    return {
      feedName: 'bookmarks',
      feedQueryKey: defaultKey,
      query: BOOKMARKS_FEED_QUERY,
      onEmptyFeed: () => setShowEmptyScreen(true),
      options: { refetchOnMount: true },
    };
  }, [searchQuery, user]);

  if (showEmptyScreen) {
    return <BookmarkEmptyScreen />;
  }

  const shareBookmarksButton = (style: string, text?: string) => (
    <Button
      className={style}
      icon={<ShareIcon secondary={showSharedBookmarks} />}
      onClick={() => setShowSharedBookmarks(true)}
    >
      {text}
    </Button>
  );

  return (
    <FeedPage>
      {children}
      <FeedPageHeader className="mb-5">
        <h3 className="font-bold typo-callout">Bookmarks</h3>
      </FeedPageHeader>
      <CustomFeedHeader className="flex mb-6">
        {searchChildren}
        {shareBookmarksButton(
          'hidden laptop:flex ml-4 btn-secondary',
          'Share bookmarks',
        )}
        {shareBookmarksButton('flex laptop:hidden ml-4 btn-secondary')}
      </CustomFeedHeader>

      {showSharedBookmarks && (
        <SharedBookmarksModal
          isOpen={showSharedBookmarks}
          onRequestClose={() => setShowSharedBookmarks(false)}
        />
      )}
      {tokenRefreshed && <Feed {...feedProps} />}
    </FeedPage>
  );
}
