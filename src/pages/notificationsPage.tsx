import { useEffect, type JSX, useState } from 'react';
import { useAppDispatch, useAppSelector, useTitle } from '../utils/hooks';
import { fetchNotifications } from '../thunks/notificationThunks/notificationListThunk';
import { markNotificationsAsRead } from '../thunks/notificationThunks/notificationAsReadThunk';
import NotificationItem from '../components/notifications/notificationItem';
import { setError } from '../slices/ui/uiSlice';
import '../styles/notificationsPage.css';
import { DEVELOPER_MODE } from '../appConfig';
import TabbedHeader from '../components/common/tabbedHeader';

const NotificationsPage = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const { notifications, loading, error, currentPage, hasMore, unreadCount } = useAppSelector((state) => state.notifications);

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    // const [isMarkingRead, setIsMarkingRead] = useState(false);

    useEffect(() => {
        let readTimer: number;
        // Only set the timer if there are unread notifications
        if (unreadCount > 0) {
            readTimer = window.setTimeout(() => {
                // 1. Filter the currently loaded notifications to find the unread ones.
                const unreadNotificationIds = notifications.filter(notif => !notif.isRead).map(notif => notif.id);

                // 2. Only dispatch the action if there are IDs to send.
                if (unreadNotificationIds.length > 0) {
                    dispatch(markNotificationsAsRead({ notificationIds: unreadNotificationIds }));
                }
            }, 1000);
        }
        return () => {
            if (readTimer) clearTimeout(readTimer);
        };
    }, [unreadCount, notifications, dispatch]);


    useEffect(() => {
        // Only fetch if not already loading or succeeded to prevent redundant fetches
        if (loading === 'idle' && notifications.length === 0) {
            dispatch(fetchNotifications({ page: 1 }));
        }
    }, [dispatch, notifications.length]);

    useTitle('Notifications - WolexChange')

    // --- HANDLES MARKING ALL NOTIFICATIONS AS READ ---
    // const handleMarkAllAsRead = async () => {
    //     setIsMarkingRead(true);
    //     try {
    //         // Dispatch with an empty object to trigger the "mark all" logic
    //         await dispatch(markNotificationsAsRead({})).unwrap();
    //     } catch (err) {
    //         dispatch(setError("Failed to mark all notifications as read"))
    //         DEVELOPER_MODE && console.error("Failed to mark all notifications as read:", err);
    //     } finally {
    //         setIsMarkingRead(false);
    //     }
    // };

    // --- HANDLE LOAD MORE FUNCTION ---
    const handleLoadMore = async () => {
        if (hasMore && !isLoadingMore) {
            setIsLoadingMore(true);
            try {
                await dispatch(fetchNotifications({ page: currentPage + 1 })).unwrap();
            } catch (err) {
                dispatch(setError("Failed to fetch more notifications."))
                DEVELOPER_MODE && console.error("Failed to fetch more notifications:", err);
            } finally {
                setIsLoadingMore(false);
            }
        }
    };

    return (
        <div className={"notifications-page-container"}>
            <TabbedHeader tabs={[{ path: '/notifications', label: 'All Notifications' }]} />

            {/* --- THE MARK ALL BUTTON --- */}
            {/*unreadCount > 0 && (
                <div className="notifications-actions">
                    <button
                        onClick={handleMarkAllAsRead}
                        disabled={isMarkingRead}
                        className="btn btn-secondary "
                    >
                        {isMarkingRead ? 'Marking...' : 'Mark all as read'}
                    </button>
                </div>
            )*/}
            <div className="notifications-list">
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                    />
                ))}

                {loading === 'pending' && notifications.length === 0 && (
                    <p className="notifications-message">Loading...</p>
                )}

                {loading === 'succeeded' && error && (
                    <p className="notifications-message error">{error}</p>
                )}

                {loading === 'succeeded' && !error && notifications.length === 0 && (
                    <p className="notifications-message">You have no notifications.</p>
                )}
                {hasMore && (
                    <div className="load-more-container">
                        <button
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            className="btn btn-secondary btn-pill"
                        >
                            {isLoadingMore ? 'Loading...' : 'Load more'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;