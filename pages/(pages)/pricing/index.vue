<script setup>
import { ref } from "vue"; // Import ref

definePageMeta({
    layout: "content",
});

// --- Popup State and Data ---
const isPopupVisible = ref(false);
const name = ref("");
const email = ref("");
const phone = ref("");
// --- End Popup State ---

const plans = [
    {
        name: "Free",
        price: "₹0",
        frequency: "/ forever",
        description:
            "Perfect for getting started. Store your essential notes and basic media.",
        features: [
            "25MB Cloud Storage",
            "Store images & audio notes",
            "Basic file support",
            "Included for all users",
        ],
        cta: "Current Plan",
        action: null, // No action for current plan
        isCurrent: true, // Example flag
        highlight: false,
    },
    {
        name: "Pro",
        price: "₹1111",
        frequency: "/ year",
        description:
            "Ideal for users who need more space for their projects and media.",
        features: [
            "1GB Cloud Storage",
            "Store images, audio notes, and various file types",
            "Enhanced file support",
            "Support development of Tackpad for everyone",
        ],
        cta: "Upgrade to Pro",
        action: "openUpgradePopup", // Action identifier
        isCurrent: false,
        highlight: true, // Highlight this plan
    },
];

// --- Popup Functions ---
const openUpgradePopup = () => {
    // Reset form fields when opening
    name.value = "";
    email.value = "";
    phone.value = "";
    isPopupVisible.value = true;
};

const closePopup = () => {
    isPopupVisible.value = false;
};

const handlePayNow = () => {
    // Basic validation example (optional)
    if (!name.value || !email.value) {
        alert("Please fill in your name and email.");
        return;
    }
    console.log("Processing Payment (Simulation)...");
    console.log("Name:", name.value);
    console.log("Email:", email.value);
    console.log("Phone:", phone.value);
    // Here you would integrate with a payment gateway in a real app.
    // For now, just close the popup.
    closePopup();
};

// Helper to trigger action based on plan
const handlePlanAction = (actionName) => {
    if (actionName === "openUpgradePopup") {
        openUpgradePopup();
    }
    // Add other actions here if needed
};

// --- End Popup Functions ---
</script>

<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center mb-16">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
                Tackpad Storage Plans
            </h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose the right storage plan for your needs. Securely store
                images, audio notes, and files alongside your notes.
            </p>
        </div>

        <div
            class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch"
        >
            <div
                v-for="plan in plans"
                :key="plan.name"
                :class="[
                    'bg-white p-8 rounded-lg shadow-md border flex flex-col',
                    plan.highlight ? 'border-blue-500' : 'border-gray-200',
                ]"
            >
                <h2 class="text-2xl font-semibold text-gray-900 mb-2">
                    {{ plan.name }}
                </h2>
                <p class="text-gray-600 mb-4">{{ plan.description }}</p>

                <div class="mb-6">
                    <span class="text-4xl font-bold text-gray-900">{{
                        plan.price
                    }}</span>
                    <span class="text-gray-500 ml-1">{{ plan.frequency }}</span>
                </div>

                <ul class="space-y-2 text-gray-700 mb-8 flex-grow">
                    <li
                        v-for="feature in plan.features"
                        :key="feature"
                        class="flex items-center"
                    >
                        <svg
                            class="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <span>{{ feature }}</span>
                    </li>
                </ul>

                <button
                    :disabled="plan.isCurrent"
                    @click="handlePlanAction(plan.action)"
                    :class="[
                        'mt-auto w-full font-medium py-2 px-4 rounded transition duration-150 ease-in-out',
                        plan.isCurrent
                            ? 'bg-gray-200 text-gray-700 cursor-not-allowed'
                            : plan.highlight
                              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                              : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    ]"
                >
                    {{ plan.cta }}
                </button>
            </div>
        </div>

        <!-- Upgrade Popup Modal -->
        <div v-if="isPopupVisible" class="fixed inset-0 z-50 overflow-y-auto">
            <div
                class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
            >
                <!-- Background overlay -->
                <div
                    class="fixed inset-0 transition-opacity"
                    aria-hidden="true"
                    @click="closePopup"
                >
                    <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <!-- This element is to trick the browser into centering the modal contents. -->
                <span
                    class="hidden sm:inline-block sm:align-middle sm:h-screen"
                    aria-hidden="true"
                    >&#8203;</span
                >

                <!-- Modal panel -->
                <div
                    class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-headline"
                    @click.stop
                >
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div
                                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10"
                            >
                                <!-- Heroicon name: outline/currency-dollar -->
                                <svg
                                    class="h-6 w-6 text-blue-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div
                                class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full"
                            >
                                <h3
                                    class="text-lg leading-6 font-medium text-gray-900"
                                    id="modal-headline"
                                >
                                    Upgrade to Tackpad Pro
                                </h3>
                                <div class="mt-4 space-y-4 text-left">
                                    <div>
                                        <label
                                            for="name"
                                            class="block text-sm font-medium text-gray-700"
                                            >Name</label
                                        >
                                        <input
                                            v-model="name"
                                            type="text"
                                            name="name"
                                            id="name"
                                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            for="email"
                                            class="block text-sm font-medium text-gray-700"
                                            >Email Address</label
                                        >
                                        <input
                                            v-model="email"
                                            type="email"
                                            name="email"
                                            id="email"
                                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            for="phone"
                                            class="block text-sm font-medium text-gray-700"
                                            >Phone Number (Optional)</label
                                        >
                                        <input
                                            v-model="phone"
                                            type="tel"
                                            name="phone"
                                            id="phone"
                                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="+1 555-123-4567"
                                        />
                                    </div>

                                    <div
                                        class="mt-6 pt-5 border-t border-gray-200"
                                    >
                                        <div
                                            class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-inner text-center"
                                        >
                                            <p
                                                class="text-sm font-medium text-indigo-600 uppercase tracking-wider mb-1"
                                            >
                                                Total Amount Due
                                            </p>
                                            <p
                                                class="text-3xl font-extrabold text-gray-900"
                                            >
                                                ₹1111
                                                <span
                                                    class="text-lg font-medium text-gray-500"
                                                    >/ year</span
                                                >
                                            </p>
                                            <p
                                                class="text-xs text-gray-500 mt-1"
                                            >
                                                (Billed Annually)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse"
                    >
                        <button
                            @click="handlePayNow"
                            type="button"
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Pay Now
                        </button>
                        <button
                            @click="closePopup"
                            type="button"
                            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <!-- End Upgrade Popup Modal -->

        <div class="mt-16 bg-gray-50 rounded-xl p-8">
            <div class="max-w-3xl mx-auto text-center">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">
                    Frequently Asked Questions
                </h2>
                <div class="space-y-6 text-left">
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">
                            What counts towards my storage limit?
                        </h3>
                        <p class="mt-2 text-gray-600">
                            All uploaded files attached to your notes, including
                            images, audio recordings, PDFs, and other documents,
                            count towards your storage quota. The text content
                            of your notes uses a negligible amount of space.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">
                            Is the 25MB free storage per user or per workspace?
                        </h3>
                        <p class="mt-2 text-gray-600">
                            The 25MB storage limit on the Free plan is per
                            individual user account.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">
                            How do I upgrade to the Pro plan?
                        </h3>
                        <p class="mt-2 text-gray-600">
                            You can upgrade to the Pro plan by clicking the
                            "Upgrade to Pro" button above, which will prompt you
                            for payment details, or by navigating to your
                            account settings / billing section within the
                            Tackpad application.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">
                            What happens if I exceed my storage limit on the
                            Free plan?
                        </h3>
                        <p class="mt-2 text-gray-600">
                            If you reach the 25MB limit, you won't be able to
                            upload new files until you either delete some
                            existing files to free up space or upgrade to the
                            Pro plan. You will still be able to access all your
                            existing notes and files.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">
                            Is the $10/year payment automatically recurring?
                        </h3>
                        <p class="mt-2 text-gray-600">
                            Yes, the Pro plan subscription is billed annually at
                            $10 per year. You can manage your subscription and
                            payment details in your account settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
