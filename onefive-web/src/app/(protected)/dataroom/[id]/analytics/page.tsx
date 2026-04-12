"use client";
import React, { useState, use } from "react";
import type { Key } from "react-aria-components";
import { RefreshCw01 as RefreshCw } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Tabs } from "@/components/application/tabs/tabs";
import { NativeSelect } from "@/components/base/select/select-native";
import { TooltipProvider } from "@/components/ui/tooltip";
import * as Alerts from "@/components/application/alerts/alerts";
import { UserAnalytics, FileAnalytics, SortField, SortDirection, FileSortField } from "./types";
import { useDataroomAnalytics } from "./hooks/useDataroomAnalytics";
import { useFileAnalytics } from "./hooks/useFileAnalytics";
import { useUserAnalytics, useUserTimeline } from "./hooks/useUserAnalytics";
import {
    AnalyticsHeader,
    OverviewTab,
    UsersList,
    FilesTab,
    TimelineTab,
    UserDetailsSidebar,
    FileDetailsSidebar
} from "@/components/analytics";
import Navbar from "@/components/navbar";

export default function DataroomAnalytics({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [selectedTabIndex, setSelectedTabIndex] = useState<Key>("overview");
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [fileSearchQuery, setFileSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserAnalytics | null>(null);
    const [selectedFile, setSelectedFile] = useState<FileAnalytics | null>(null);
    const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);
    const [isFileSidebarOpen, setIsFileSidebarOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | '90d'>("7d");

    // Sorting
    const [userSortField, setUserSortField] = useState<SortField>('totalViews');
    const [userSortDirection, setUserSortDirection] = useState<SortDirection>('desc');
    const [fileSortField, setFileSortField] = useState<FileSortField>('totalViews');
    const [fileSortDirection, setFileSortDirection] = useState<SortDirection>('desc');

    // Pagination
    const [usersPage, setUsersPage] = useState(1);
    const [filesPage, setFilesPage] = useState(1);
    const [timelinePage, setTimelinePage] = useState(1);

    // Group/role filter
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [selectedGroup, setSelectedGroup] = useState<string>('all');

    const tabs = [
        { id: "overview", label: "Vue d'ensemble" },
        { id: "users", label: "Utilisateurs" },
        { id: "files", label: "Fichiers" },
        { id: "timeline", label: "Timeline" },
    ];

    const {
        isLoading,
        isError,
        error,
        dashboardStats,
        userAnalytics,
        fileAnalytics,
        activityLogs,
        activityChartData,
        comparisonChartData,
        isComparing,
        toggleComparison,
        rawData,
        lastUpdatedAt,
        refetch
    } = useDataroomAnalytics(resolvedParams.id, selectedPeriod);

    const { data: selectedUserDetails, isLoading: isLoadingUserDetails } = useUserAnalytics(
        resolvedParams.id,
        selectedUser?.id || null,
        selectedPeriod
    );

    const { data: selectedFileDetails, isLoading: isLoadingFileDetails } = useFileAnalytics(
        resolvedParams.id,
        selectedFile?.id || null,
        selectedPeriod
    );

    const { data: userTimelineData, isLoading: isLoadingUserTimeline } = useUserTimeline(
        resolvedParams.id,
        selectedUser?.id || null,
        selectedPeriod
    );

    const handleTabChange = (key: Key) => {
        setSelectedTabIndex(key);
        setUsersPage(1);
        setFilesPage(1);
        setTimelinePage(1);
    };

    const handleUserSelect = (user: UserAnalytics) => {
        setSelectedUser(user);
        setIsUserSidebarOpen(true);
    };

    const handleFileSelect = (file: FileAnalytics) => {
        setSelectedFile(file);
        setIsFileSidebarOpen(true);
    };

    const handleCloseUserSidebar = () => {
        setIsUserSidebarOpen(false);
        setTimeout(() => setSelectedUser(null), 300);
    };

    const handleCloseFileSidebar = () => {
        setIsFileSidebarOpen(false);
        setTimeout(() => setSelectedFile(null), 300);
    };

    const handleUserSort = (field: SortField) => {
        if (field === userSortField) {
            setUserSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setUserSortField(field);
            setUserSortDirection('desc');
        }
        setUsersPage(1);
    };

    const handleFileSort = (field: FileSortField) => {
        if (field === fileSortField) {
            setFileSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setFileSortField(field);
            setFileSortDirection('desc');
        }
        setFilesPage(1);
    };

    if (isError) {
        return (
            <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <Alerts.AlertFloating
                        color="error"
                        title="Erreur de chargement"
                        description={error || "Une erreur est survenue lors du chargement des analytics. Vérifiez votre connexion et réessayez."}
                        confirmLabel="Recharger"
                        onConfirm={() => window.location.reload()}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FCFCFD] min-h-screen">
            <Navbar />
            <TooltipProvider>
                <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                    <AnalyticsHeader
                        dataroomId={resolvedParams.id}
                        dashboardStats={dashboardStats}
                        selectedPeriod={selectedPeriod}
                        onPeriodChange={setSelectedPeriod}
                        isLoading={isLoading}
                        rawData={rawData}
                        userAnalytics={userAnalytics}
                        fileAnalytics={fileAnalytics}
                        activityLogs={activityLogs}
                        lastUpdatedAt={lastUpdatedAt}
                        onRefresh={refetch}
                    />

                    <div className="space-y-6">
                        <NativeSelect
                            value={selectedTabIndex as string}
                            onChange={(event) => handleTabChange(event.target.value)}
                            options={tabs.map((tab) => ({ label: tab.label, value: tab.id }))}
                            className="w-80 md:hidden"
                        />
                        <Tabs selectedKey={selectedTabIndex} onSelectionChange={handleTabChange} className="w-max max-md:hidden">
                            <Tabs.List type="underline" items={tabs}>
                                {(tab) => <Tabs.Item {...tab} />}
                            </Tabs.List>
                        </Tabs>

                        {selectedTabIndex === "overview" && (
                            <OverviewTab
                                dashboardStats={dashboardStats}
                                userAnalytics={userAnalytics}
                                fileAnalytics={fileAnalytics}
                                activityChartData={activityChartData}
                                comparisonChartData={comparisonChartData}
                                isComparing={isComparing}
                                onToggleComparison={toggleComparison}
                                isLoading={isLoading}
                                onUserSelect={handleUserSelect}
                                onFileSelect={handleFileSelect}
                            />
                        )}

                        {selectedTabIndex === "users" && (
                            <UsersList
                                users={userAnalytics}
                                onUserSelect={handleUserSelect}
                                searchQuery={userSearchQuery}
                                setSearchQuery={setUserSearchQuery}
                                isLoading={isLoading}
                                sortField={userSortField}
                                sortDirection={userSortDirection}
                                onSort={handleUserSort}
                                page={usersPage}
                                onPageChange={setUsersPage}
                                selectedRole={selectedRole}
                                onRoleChange={setSelectedRole}
                                selectedGroup={selectedGroup}
                                onGroupChange={setSelectedGroup}
                            />
                        )}

                        {selectedTabIndex === "files" && (
                            <FilesTab
                                fileAnalytics={fileAnalytics}
                                searchQuery={fileSearchQuery}
                                setSearchQuery={setFileSearchQuery}
                                onFileSelect={handleFileSelect}
                                isLoading={isLoading}
                                sortField={fileSortField}
                                sortDirection={fileSortDirection}
                                onSort={handleFileSort}
                                page={filesPage}
                                onPageChange={setFilesPage}
                            />
                        )}

                        {selectedTabIndex === "timeline" && (
                            <TimelineTab
                                activityLogs={activityLogs}
                                isLoading={isLoading}
                                page={timelinePage}
                                onPageChange={setTimelinePage}
                            />
                        )}
                    </div>
                </main>

                <UserDetailsSidebar
                    user={selectedUser}
                    isOpen={isUserSidebarOpen}
                    onClose={handleCloseUserSidebar}
                    userDetails={selectedUserDetails}
                    userTimelineData={userTimelineData}
                    isLoadingUserDetails={isLoadingUserDetails}
                    isLoadingUserTimeline={isLoadingUserTimeline}
                />

                <FileDetailsSidebar
                    file={selectedFile}
                    isOpen={isFileSidebarOpen}
                    onClose={handleCloseFileSidebar}
                    fileDetails={selectedFileDetails}
                    isLoadingFileDetails={isLoadingFileDetails}
                />
            </TooltipProvider>
        </div>
    );
}
