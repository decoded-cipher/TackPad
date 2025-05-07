<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useBoardStore } from "@/stores/board";
import Modal from "./UI/Modal.vue"; // Ensure path is correct
import UIToast from "./UI/Toast.vue"; // Assuming this is the correct path for UIToast
import useToast from "@/composables/useToast";
import { useBoard } from "@/composables/useBoard"; // Assuming useBoard is the correct path

const { error, success, warning, toasts, removeToast } = useToast();
const { boardStore } = useBoard(); // Only boardStore is used from useBoard in this snippet

const showModal = ref(true); // This would typically be controlled by a parent via v-model
const activeTab = ref("export");
const displayedBoardsForExport = ref<Record<string, any>>({}); // Replace 'any' with your BoardType if available
const selectedBoardIdsForExport = ref(new Set<string>());

const allBoardsFromStore = computed(() => boardStore.boards);

watch(
    showModal,
    (newValue) => {
        if (newValue) {
            // When modal opens (or is already open on component setup),
            // copy the current boards from the store
            console.log(
                "ExportModal: showModal is true, initializing/resetting export list.",
            );
            console.log(
                "Current allBoardsFromStore:",
                JSON.parse(JSON.stringify(allBoardsFromStore.value)),
            );

            displayedBoardsForExport.value = { ...allBoardsFromStore.value };

            // Select all boards by default
            selectedBoardIdsForExport.value.clear();
            Object.keys(displayedBoardsForExport.value).forEach((boardId) => {
                selectedBoardIdsForExport.value.add(boardId);
            });

            console.log(
                "Updated displayedBoardsForExport:",
                JSON.parse(JSON.stringify(displayedBoardsForExport.value)),
            );
            console.log(
                "Updated selectedBoardIdsForExport:",
                Array.from(selectedBoardIdsForExport.value),
            );
        } else {
            console.log("ExportModal: showModal is false.");
            // Optionally, you could clear displayedBoardsForExport here if you want it to be empty
            // when the modal is not shown, but it will be re-initialized on next open anyway.
            // displayedBoardsForExport.value = {};
            // selectedBoardIdsForExport.value.clear();
        }
    },
    { immediate: true },
);

const handleCheckboxChange = (boardId: string, event: Event) => {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
        selectedBoardIdsForExport.value.add(boardId);
    } else {
        selectedBoardIdsForExport.value.delete(boardId);
    }
};

const removeFromExportList = (boardId: string) => {
    // Create a new object to ensure reactivity when a key is deleted
    const newDisplayedBoards = { ...displayedBoardsForExport.value };
    delete newDisplayedBoards[boardId];
    displayedBoardsForExport.value = newDisplayedBoards;

    selectedBoardIdsForExport.value.delete(boardId); // Also deselect it
};
const emit = defineEmits("backupSuccess");
const BACKUP_LOCALSTORAGE_KEY = "isBackedUp";
const handleExport = async () => {
    if (selectedBoardIdsForExport.value.size === 0) {
        warning("Please select at least one board to export.");
        return;
    }

    const boardsToExportPayload = Array.from(selectedBoardIdsForExport.value)
        .map((boardId) => {
            const boardData = displayedBoardsForExport.value[boardId];
            // Ensure boardData exists and has the necessary properties
            if (
                boardData &&
                typeof boardData.board_id === "string" &&
                typeof boardData.title === "string"
            ) {
                return { id: boardData.board_id, title: boardData.title };
            }
            console.warn(
                `Board data for ID ${boardId} not found or incomplete in displayedBoardsForExport during export.`,
            );
            return null;
        })
        .filter(Boolean) as Array<{ id: string; title: string }>; // Type assertion for the final array

    if (boardsToExportPayload.length === 0) {
        warning(
            "No valid boards selected for export. Check board data integrity.",
        );
        return;
    }

    const res = await boardStore.backupBoards(boardsToExportPayload);

    if (res.success === true && res.data && res.data.length > 0) {
        try {
            const filename = `tackpad_boards_backup_${new Date().toISOString().split("T")[0]}.tackpad`;
            const jsonStr = JSON.stringify(res.data, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" }); // Or "application/octet-stream" for .tackpad
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            localStorage.setItem(BACKUP_LOCALSTORAGE_KEY, "true");
            success(
                `${boardsToExportPayload.length} board(s) exported successfully!`,
            );
            showModal.value = false;
            emit("backupSuccess");
        } catch (err) {
            console.error("Export failed:", err);
            error("An error occurred during export.");
        }
    } else if (res.success === false) {
        error(res.message || "Export operation failed at the backend.");
    } else {
        warning(
            "No data was returned from the backup process, or an unknown issue occurred.",
        );
    }
};

const handleImportClick = () => {
    warning("Import functionality will be implemented later.");
};

const getBoardUrl = (boardId: string) => {
    // Assuming 'boardId' (the key from displayedBoardsForExport) is the correct ID for routing.
    // If boardData.board_id is the canonical/routable ID, use that instead.
    // For consistency with original, using boardId (key) here.
    return `/board/${boardId}`;
};

const areAllDisplayedBoardsSelected = computed(() => {
    const displayedIds = Object.keys(displayedBoardsForExport.value);
    if (displayedIds.length === 0) {
        return false;
    }
    return displayedIds.every((id) => selectedBoardIdsForExport.value.has(id));
});

const toggleSelectAll = (event: Event) => {
    const shouldSelectAll = (event.target as HTMLInputElement).checked;
    const displayedIds = Object.keys(displayedBoardsForExport.value);

    if (shouldSelectAll) {
        displayedIds.forEach((id) => selectedBoardIdsForExport.value.add(id));
    } else {
        selectedBoardIdsForExport.value.clear(); // Clears all, which is fine.
    }
};

const switchTab = (tab: string) => {
    activeTab.value = tab;
};
</script>

<template>
    <div>
        <Modal
            v-model="showModal"
            title="Import / Export Boards"
            :show-close-button="true"
        >
            <div class="tabs">
                <button
                    @click="switchTab('export')"
                    :class="[
                        'tab-button',
                        activeTab === 'export' ? 'active' : '',
                    ]"
                >
                    Export
                </button>
                <button
                    @click="switchTab('import')"
                    :class="[
                        'tab-button',
                        activeTab === 'import' ? 'active' : '',
                    ]"
                >
                    Import
                </button>
            </div>

            <div class="tab-content">
                <!-- Export Tab -->
                <div v-if="activeTab === 'export'" class="backup-section">
                    <p class="section-description">
                        Select the boards you want to include in the backup
                        file.
                    </p>

                    <!-- MODIFIED: Condition now uses displayedBoardsForExport -->
                    <div
                        v-if="Object.keys(displayedBoardsForExport).length > 0"
                        class="select-all-container"
                    >
                        <input
                            type="checkbox"
                            id="select-all-export"
                            :checked="areAllDisplayedBoardsSelected"
                            @change="toggleSelectAll"
                            class="select-all-checkbox"
                        />
                        <label for="select-all-export" class="select-all-label">
                            Select All / Deselect All
                        </label>
                    </div>

                    <!-- MODIFIED: Condition and v-for now use displayedBoardsForExport -->
                    <ul
                        v-if="Object.keys(displayedBoardsForExport).length > 0"
                        class="board-list h-40 md:h-full"
                    >
                        <li
                            v-for="(
                                boardData, boardId
                            ) in displayedBoardsForExport"
                            :key="boardId"
                            class="board-item"
                        >
                            <input
                                type="checkbox"
                                :id="'export-' + boardId"
                                :value="boardId"
                                :checked="
                                    selectedBoardIdsForExport.has(boardId)
                                "
                                @change="handleCheckboxChange(boardId, $event)"
                                class="board-checkbox"
                                :aria-labelledby="'label-' + boardId"
                            />
                            <label
                                :id="'label-' + boardId"
                                :for="'export-' + boardId"
                                class="board-title"
                            >
                                {{ boardData.title }}
                            </label>
                            <div class="board-actions">
                                <a
                                    :href="getBoardUrl(boardId)"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="action-button view-button"
                                    title="View Board"
                                >
                                    👁️
                                    <span class="sr-only"
                                        >View {{ boardData.title }}</span
                                    >
                                </a>
                                <button
                                    @click="removeFromExportList(boardId)"
                                    class="action-button remove-button"
                                    title="Remove from Export List"
                                >
                                    🗑️
                                    <span class="sr-only"
                                        >Remove {{ boardData.title }} from
                                        export list</span
                                    >
                                </button>
                            </div>
                        </li>
                    </ul>
                    <!-- MODIFIED: v-else now correctly reflects displayedBoardsForExport emptiness -->
                    <p v-else class="no-boards-message">
                        No boards available to export.
                    </p>

                    <button
                        @click="handleExport"
                        :disabled="selectedBoardIdsForExport.size === 0"
                        class="export-button btn bg-blue-500"
                    >
                        Export {{ selectedBoardIdsForExport.size }} Selected
                        Board(s)
                    </button>
                </div>

                <!-- Import Tab -->
                <div v-if="activeTab === 'import'" class="backup-section">
                    <p class="section-description">
                        Import boards from a previously exported backup file
                        (.tackpad or .json).
                        <!-- Clarified extension -->
                    </p>
                    <button
                        @click="handleImportClick"
                        class="import-button btn bg-blue-500"
                    >
                        Import from File...
                    </button>
                </div>
            </div>
            <UIToast
                class="fixed top-4 right-4"
                v-for="toast in toasts"
                :key="toast.id"
                v-bind="toast"
                @close="removeToast(toast.id)"
            />
            <template #footer>
                <button @click="showModal = false" class="btn bg-gray-500">
                    Close
                </button>
            </template>
        </Modal>
    </div>
</template>
<style scoped>
.btn {
    padding: 8px 20px;
    border-radius: 6px;
    font-weight: 500;
    color: white;
    border: none;
    transition: all 0.2s;
    font-size: 14px;
    cursor: pointer;
}

.btn.bg-blue-500 {
    background-color: #3b82f6;
}

.btn.bg-blue-500:hover {
    background-color: #2563eb;
}

.btn.bg-gray-500 {
    background-color: #6b7280;
}

.btn.bg-gray-500:hover {
    background-color: #4b5563;
}

.tabs {
    display: flex;
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 16px;
}

.tab-button {
    padding: 10px 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    color: #666;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
}

.tab-button.active {
    color: #3b82f6;
    border-bottom: 2px solid #3b82f6;
}

.tab-button:hover:not(.active) {
    color: #4b5563;
    background-color: #f9fafb;
}

.tab-content {
    padding: 10px 0;
}

.backup-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.section-description {
    margin: 0 0 8px 0;
    font-size: 0.9rem;
    color: #666;
}

.select-all-container {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-bottom: none;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
}

.select-all-checkbox {
    margin-right: 8px;
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.select-all-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #555;
    cursor: pointer;
}

.board-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}

.board-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid #f0f0f0;
    gap: 10px;
}

.board-item:last-child {
    border-bottom: none;
}

.board-checkbox {
    margin-right: 8px;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.board-title {
    flex-grow: 1;
    font-size: 0.95rem;
    color: #444;
    cursor: pointer;
}

.board-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.action-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    font-size: 1rem;
    line-height: 1;
    color: #777;
    transition:
        background-color 0.2s,
        color 0.2s;
    text-decoration: none;
}

.action-button:hover {
    background-color: #f0f0f0;
    color: #333;
}

.action-button.remove-button:hover {
    color: #d9534f;
}

.export-button,
.import-button {
    align-self: flex-start;
    margin-top: 8px;
}

.export-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.no-boards-message {
    color: #888;
    font-style: italic;
    padding: 15px;
    text-align: center;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
</style>
