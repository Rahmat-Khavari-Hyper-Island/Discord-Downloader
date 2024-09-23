// frontend/script.js

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('login-form').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            // Send POST request to backend's /api/auth/login
            const response = await fetch("https://discord.com/api/v10/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: username,
                    password: password,
                }),
            });



            const data = await response.json();
            if (data && data.token) {
                // Store token in localStorage
                localStorage.setItem('discordToken', data.token);
                console.log("Login successful, token saved to localStorage.");
                // Clear input fields
                usernameInput.value = '';
                passwordInput.value = '';
                // Optionally fetch servers
                await fetchMyServers(data.token);
            } else {
                console.error("No token received.", data.message);
            }
        } catch (error) {
            console.error("Login failed", error);
        }
    });
});


// Load some codes upon loading the page
document.addEventListener("DOMContentLoaded", async () => {
    const storedToken = localStorage.getItem('discordToken');

    if (storedToken) {
        await fetchMyServers(storedToken);
    } else {
        // No need to handle default credentials; use the form submission to log in
    }

    // Initialize the first tab as active
    const firstTab = document.querySelector(".details-section__tab");
    if (firstTab) {
        firstTab.click();
    }
});


//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Define a variable to store the server name or direct message username
let currentServerName = '';

// Helper function to check if an ID is valid
function isValidId(id) {
    return id && id !== 'null' && id !== 'undefined' && id.trim() !== '';
}

// Helper function to create an image element with fallback SVG
function createImageOrFallback(imageURL, altText) {
    if (imageURL) {
        const img = document.createElement('img');
        img.src = imageURL;
        img.alt = altText;
        img.onerror = () => {
            if (img.parentNode) {
                img.parentNode.replaceChild(createFallbackSVG(), img);
            }
        };
        return img;
    } else {
        return createFallbackSVG();
    }
}

// Function to create the fallback SVG element
function createFallbackSVG() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("role", "img");
    svg.setAttribute("width", "30");
    svg.setAttribute("height", "30");
    svg.setAttribute("fill", "none");
    svg.setAttribute("viewBox", "0 0 24 24");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("d", "M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 0 0 .96 17.7a18.43 18.43 0 0 0 5.63 2.87c.46-.62.86-1.28 1.2-1.98-.65-.25-1.29-.55-1.9-.92.17-.12.32-.24.47-.37 3.58 1.7 7.7 1.7 11.28 0l.46.37c-.6.36-1.25.67-1.9.92.35.7.75 1.35 1.2 1.98 2.03-.63 3.94-1.6 5.64-2.87.47-4.87-.78-9.09-3.3-12.83ZM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.89 2.27-2 2.27Zm7.4 0c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.88 2.27-2 2.27Z");

    svg.appendChild(path);
    return svg;
}

// Fetch user servers
async function fetchMyServers(Server_Token) {
    if (Server_Token) {
        try {
            const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
                headers: { Authorization: Server_Token },
            });
            const data = await response.json();
            updateSidebar(data);
        } catch (error) {
            console.error("Fetching user servers failed", error);
        }
    }
}

// Function to get the server icon URL
function getServerIconURL(serverId, iconId) {
    return isValidId(iconId) ? `https://cdn.discordapp.com/icons/${serverId}/${iconId}.png?size=512` : null;
}

// Function to get the user's avatar or banner URL
function getUserImageURL(userId, bannerId, avatarId) {
    if (isValidId(bannerId)) {
        return `https://cdn.discordapp.com/banners/${userId}/${bannerId}.png?size=512`;
    } else if (isValidId(avatarId)) {
        return `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.png?size=512`;
    }
    return null;
}

// Function that creates the first item (Direct Messages) and the separator
function createSidebarFirstItem() {
    const sidebar = document.querySelector('.sidebar--server');

    const sidebarItem = document.createElement('div');
    sidebarItem.classList.add('sidebar__item');

    const sidebarIcon = document.createElement('div');
    sidebarIcon.classList.add('sidebar__item-icon');
    sidebarIcon.appendChild(createFallbackSVG());

    const sidebarName = document.createElement('span');
    sidebarName.classList.add('sidebar__item-name');
    sidebarName.textContent = 'Direct Messages';

    sidebarItem.append(sidebarIcon, sidebarName);
    sidebar.append(sidebarItem);

    const separator = document.createElement('div');
    separator.classList.add('sidebar__separator');
    sidebar.appendChild(separator);

    sidebarItem.addEventListener('click', () => {
        fetchMyServerChannels();
    });
}

// Function to render servers (already correct)
async function updateSidebar(servers) {
    const sidebar = document.querySelector('.sidebar--server');
    createSidebarFirstItem();

    for (const server of servers) {
        const sidebarItem = document.createElement('div');
        sidebarItem.classList.add('sidebar__item');
        sidebarItem.dataset.serverId = server.id;

        const sidebarIcon = document.createElement('div');
        sidebarIcon.classList.add('sidebar__item-icon');

        const iconURL = getServerIconURL(server.id, server.icon);
        const iconElement = createImageOrFallback(iconURL, 'icon');
        sidebarIcon.appendChild(iconElement);

        const sidebarName = document.createElement('span');
        sidebarName.classList.add('sidebar__item-name');
        sidebarName.textContent = server.name;

        sidebarItem.append(sidebarIcon, sidebarName);
        sidebarItem.addEventListener('click', () => {
            currentServerName = server.name; // Update currentServerName to the server name
            console.log(`Server Name: ${currentServerName}`);
            fetchServerChannels(server.id);
        });

        sidebar.appendChild(sidebarItem);
    }
}

// Function to replace banner or avatar URL in the sidebar
function replaceBannerInSidebar(userId, imageURL) {
    const sidebarItems = document.querySelectorAll('.sidebar__item');
    sidebarItems.forEach(item => {
        if (item.dataset.userId === userId) {
            const sidebarIcon = item.querySelector('.sidebar__item-icon');
            sidebarIcon.innerHTML = '';
            const iconElement = createImageOrFallback(imageURL, 'User Image');
            sidebarIcon.appendChild(iconElement);
        }
    });
}

// Function to update direct message user banners
async function updateDirectMessageBanners(directMessages) {
    for (const dm of directMessages) {
        const user = dm.user;
        const userId = user.id;
        const imageURL = getUserImageURL(userId, user.banner, user.avatar);

        console.log(`Processing user: ${userId}, Image URL: ${imageURL}`);

        if (imageURL) {
            try {
                const response = await fetch(imageURL, { method: 'HEAD' });
                if (response.ok) {
                    replaceBannerInSidebar(userId, imageURL);
                } else {
                    replaceBannerInSidebar(userId, null);
                }
            } catch (error) {
                console.error(`Error fetching image for user ${userId}:`, error);
                replaceBannerInSidebar(userId, null);
            }
        } else {
            replaceBannerInSidebar(userId, null);
        }
    }
}

// Function to render direct messages
function renderDirectMessages(directMessages) {
    const container = document.querySelector('#directMessagesContainer');
    container.innerHTML = '';

    directMessages.forEach(dm => {
        const user = dm.user;
        const dmItem = document.createElement('div');
        dmItem.classList.add('directMessageItem');
        dmItem.id = user.id;

        const userBannerDiv = document.createElement('div');
        userBannerDiv.classList.add('userBanner');

        const imageURL = getUserImageURL(user.id, user.banner, user.avatar);
        const imageElement = createImageOrFallback(imageURL, `${user.username}'s avatar`);
        userBannerDiv.appendChild(imageElement);

        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = user.username;

        dmItem.append(userBannerDiv, usernameSpan);

        // Add event listener to update the currentServerName and fetch messages
        dmItem.addEventListener('click', () => {
            currentServerName = user.username; // Update currentServerName to the username
            console.log(`Current DM Name: ${currentServerName}`);
            fetchMyServerChannels(); // Call the function to fetch messages for the selected DM
        });

        container.appendChild(dmItem);
    });
}


// Placeholder function for fetching server channels
function fetchServerChannels(serverId) {
    console.log(`Fetching channels for server ID: ${serverId}`);
}

// Placeholder function for fetching channels for Direct Messages
function fetchMyServerChannels() {
    console.log('Fetching channels for Direct Messages');
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


/// Global variable to store the current channel name
let currentChannelName = '';

// Utility function to get the stored token
function getStoredToken() {
    const storedToken = localStorage.getItem('discordToken');
    if (!storedToken) {
        throw new Error('No token found in localStorage');
    }
    return storedToken;
}

// Utility function to fetch data from Discord API
async function fetchDiscordAPI(url) {
    const token = getStoredToken();
    try {
        const response = await fetch(url, {
            headers: { Authorization: token },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Fetching ${url} failed`, error);
        throw error;
    }
}

// Function to fetch DM channels
async function fetchMyServerChannels() {
    try {
        const data = await fetchDiscordAPI('https://discord.com/api/v10/users/@me/channels');
        renderMyChannels(data);
    } catch (error) {
        console.error("Fetching DM channels failed", error);
    }
}

// Function to fetch server channels
async function fetchServerChannels(serverId) {
    try {
        const data = await fetchDiscordAPI(`https://discord.com/api/v10/guilds/${serverId}/channels`);
        renderChannels(data);
    } catch (error) {
        console.error("Fetching server channels failed", error);
    }
}

// Utility function to generate avatar URL
function getAvatarUrl(user) {
    if (!user.avatar) return null;
    const format = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}?size=128`;
}

// Function to display Direct Messages' channels
function renderMyChannels(data) {
    const channelsSection = document.querySelector('.channels-section_channel');
    channelsSection.innerHTML = '';

    data.forEach((userChannel) => {
        const recipient = userChannel.recipients[0];

        // Create the container for the direct message item
        const directMessageItem = document.createElement('div');
        directMessageItem.classList.add('directMessageItem');
        directMessageItem.id = userChannel.id;

        // Create and append the user banner container
        const userBanner = document.createElement('div');
        userBanner.classList.add('userBanner');
        directMessageItem.appendChild(userBanner);


        // Generate avatar URL or use default SVG
        const avatarUrl = getAvatarUrl(recipient);
        if (avatarUrl) {
            const avatarImg = document.createElement('img');
            avatarImg.src = avatarUrl;
            avatarImg.alt = `${recipient.username}'s avatar`;
            userBanner.appendChild(avatarImg);
        } else {
            // Reuse the createFallbackSVG function here
            const fallbackSVG = createFallbackSVG(); // Call the function from code1
            userBanner.appendChild(fallbackSVG);
        }

        // Create and append the username span
        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = recipient.username;
        directMessageItem.appendChild(usernameSpan);

        // Add event listener to fetch and display messages when clicked
        directMessageItem.addEventListener('click', () => {
            currentChannelName = recipient.username; // Update the global variable
            console.log(`Current Channel Name: ${currentChannelName}`); // Log the current channel name
            fetchChannelMessages(userChannel.id);
        });

        // Append the direct message item to the channels section
        channelsSection.appendChild(directMessageItem);
    });
}

// Function to render server channels
function renderChannels(channels) {
    const channelsSection = document.querySelector('.channels-section_channel');
    channelsSection.innerHTML = '';

    // Filter and sort channels
    const categories = channels.filter(channel => channel.type === 4).sort(sortChannels);
    const textChannels = channels.filter(channel => channel.type === 0).sort(sortChannels);
    const voiceChannels = channels.filter(channel => channel.type === 2).sort(sortChannels);

    // Render categories and channels
    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');

        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category.name;
        categoryDiv.appendChild(categoryTitle);

        const channelsInCategory = [...textChannels, ...voiceChannels].filter(channel => channel.parent_id === category.id);
        channelsInCategory.forEach(channel => {
            const channelDiv = document.createElement('div');
            channelDiv.classList.add('channel');
            channelDiv.textContent = channel.name;
            channelDiv.setAttribute('data-channel-id', channel.id);
            channelDiv.addEventListener('click', () => {
                currentChannelName = channel.name; // Update the global variable
                console.log(`Current Channel Name: ${currentChannelName}`); // Log the current channel name
                fetchChannelMessages(channel.id);
            });
            categoryDiv.appendChild(channelDiv);
        });

        channelsSection.appendChild(categoryDiv);
    });

    // Render uncategorized channels
    const uncategorizedChannels = [...textChannels, ...voiceChannels].filter(channel => !channel.parent_id);
    uncategorizedChannels.forEach(channel => {
        const channelDiv = document.createElement('div');
        channelDiv.classList.add('channel');
        channelDiv.textContent = channel.name;
        channelDiv.setAttribute('data-channel-id', channel.id);
        channelDiv.addEventListener('click', () => {
            currentChannelName = channel.name; // Update the global variable
            console.log(`Current Channel Name: ${currentChannelName}`); // Log the current channel name
            fetchChannelMessages(channel.id);
        });
        channelsSection.appendChild(channelDiv);
    });
}

// Utility function to sort channels
function sortChannels(a, b) {
    return (a.position || 0) - (b.position || 0) || (a.id || '').localeCompare(b.id || '');
}



//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

let currentChannelId = null;
let initialLoad = true;

// Helper to fetch messages from a channel
async function fetchMessages(channelId, options = { limit: 100, before: null }) {
    const storedToken = localStorage.getItem('discordToken');
    if (!storedToken) return null;

    // Ensure the limit is always set
    const limit = options.limit || 100;  // Default to 100 if limit is undefined
    const queryParams = new URLSearchParams({ limit });

    if (options.before) queryParams.append('before', options.before);

    try {
        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?${queryParams}`, {
            headers: { Authorization: storedToken },
        });
        const data = await response.json();
        // console.log("Fetched messages data:", data);  // Log fetched data
        return data;
    } catch (error) {
        console.error("Failed to fetch messages:", error);
    }
}

// Fetch and display new channel messages
async function fetchChannelMessages(channelId) {
    currentChannelId = channelId;
    const messages = await fetchMessages(channelId);
    //console.log("Messages to be displayed:", messages);  // Log messages before displaying
    if (Array.isArray(messages)) {
        clearMessagesSection();
        displayMessages(messages, { scrollToBottom: true });
    }
}

// Fetch previous messages
async function fetchPreviousMessages(channelId, messageId) {
    const messages = await fetchMessages(channelId, { before: messageId, limit: 100 });  // Explicitly pass limit
    //console.log("Previous messages to be displayed:", messages);  // Log previous messages before displaying
    if (Array.isArray(messages)) displayMessages(messages, { prepend: true });
}

// Clear message section
const clearMessagesSection = () => document.querySelector('.messages-section').innerHTML = '';

// Create a "Load Previous" button
const createLoadPreviousButton = () => {
    const button = document.createElement('button');
    button.textContent = 'Load Previous Messages';
    button.classList.add('load-previous-button');
    return button;
}

// Create message item
const createMessageItem = (message) => {
    const messageItem = document.createElement('li');
    messageItem.classList.add('message-item');
    messageItem.setAttribute('message-id', message.id);

    const author = document.createElement('div');
    author.classList.add('author');
    author.textContent = message.author.username.split('#')[0];

    const timestamp = document.createElement('div');
    timestamp.classList.add('timestamp');
    timestamp.textContent = new Date(message.timestamp).toLocaleString('en-US');

    const content = document.createElement('div');
    content.classList.add('content');
    content.textContent = message.content;

    messageItem.append(author, timestamp, content);

    // // Log each message item details
    // console.log("Creating message item:", {
    //     id: message.id,
    //     author: message.author.username.split('#')[0],
    //     timestamp: new Date(message.timestamp).toLocaleString('en-US'),
    //     content: message.content
    // });

    message.attachments?.forEach(attachment => {
        const img = document.createElement('img');
        img.src = `${attachment.proxy_url}=&format=webp&quality=lossless&width=653&height=437`;
        img.alt = attachment.filename;
        img.classList.add('thumbnail');
        img.addEventListener('click', () => window.open(attachment.url, '_blank'));
        const attachmentWrapper = document.createElement('div');
        attachmentWrapper.classList.add('attachment-wrapper');
        attachmentWrapper.appendChild(img);
        messageItem.appendChild(attachmentWrapper);

        // // Log attachment details
        // console.log("Adding attachment:", {
        //     url: img.src,
        //     filename: attachment.filename
        // });
    });

    if (message.referenced_message) {
        const reply = document.createElement('div');
        reply.classList.add('reply');
        reply.textContent = `Replying to ${message.referenced_message.author.username.split('#')[0]}: ${message.referenced_message.content}`;
        messageItem.appendChild(reply);

        // // Log reply details
        // console.log("Adding reply:", {
        //     author: message.referenced_message.author.username.split('#')[0],
        //     content: message.referenced_message.content
        // });
    }

    return messageItem;
}

// Display messages
function displayMessages(messages, { prepend = false, scrollToBottom = false } = {}) {
    const messagesSection = document.querySelector('.messages-section');
    if (!messagesSection) return;

    let messagesList = messagesSection.querySelector('ul') || document.createElement('ul');
    if (!messagesList.parentNode) messagesSection.appendChild(messagesList);

    let loadPreviousButton = messagesSection.querySelector('.load-previous-button') || createLoadPreviousButton();
    if (!loadPreviousButton.parentNode) messagesSection.insertBefore(loadPreviousButton, messagesList);

    const previousScrollTop = messagesSection.scrollTop;
    const previousHeight = messagesSection.scrollHeight;
    const fragment = document.createDocumentFragment();

    messages.reverse().forEach(message => fragment.appendChild(createMessageItem(message)));

    prepend ? messagesList.insertBefore(fragment, messagesList.firstChild)
        : messagesList.appendChild(fragment);

    if (prepend) {
        messagesSection.scrollTop = messagesSection.scrollHeight - previousHeight + previousScrollTop;
    } else if (scrollToBottom || initialLoad) {
        messagesSection.scrollTop = messagesSection.scrollHeight;
        initialLoad = false;
    }

    loadPreviousButton.onclick = () => {
        const firstMessageId = messagesList.querySelector('li')?.getAttribute('message-id');
        if (firstMessageId && currentChannelId) fetchPreviousMessages(currentChannelId, firstMessageId);
    };

    // // Log the final state of messages section
    // console.log("Messages section updated with:", {
    //     prepend,
    //     scrollToBottom,
    //     messagesCount: messages.length
    // });
}



//---------------------------------------------------------------------------------------------------

function openTab(tabName) {
    // Hide all tab-content elements
    var tabContents = document.getElementsByClassName("details-section__content");
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    // Deactivate all tabs
    var tabs = document.getElementsByClassName("details-section__tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }

    // Show the clicked tab content and activate the clicked tab
    document.getElementById(tabName).classList.add("active");
    event.currentTarget.classList.add("active");
}


//---------------------------------------------------------------------------------------------------


let stopFetching = false;
const messagesArray = [];
const pictureUrls = [];

// Utility function to convert a string to Capitalized Case while keeping underscores
const toCapitalizedCase = (str) =>
    str
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('_');

// Function to format messages with less details
const formatMessagesLessDetails = (messages) =>
    messages.map(({ author, timestamp, content, referenced_message }) => ({
        author: author.username,
        time: timestamp,
        message: content,
        ...(referenced_message && {
            repliedTo: {
                reply_author: referenced_message.author.username,
                reply_message: referenced_message.content,
            },
        }),
    }));

// Function to extract image and GIF URLs from messages
const extractMediaUrls = (messages) =>
    messages.flatMap((message) =>
        (message.attachments || [])
            .filter((attachment) =>
                ['jpg', 'jpeg', 'png', 'gif'].includes(
                    attachment.filename.split('.').pop().toLowerCase()
                )
            )
            .map((attachment) => ({
                url: attachment.url,
                filename: attachment.filename,
                timestamp: message.timestamp,
            }))
    );

// Unified function to generate filenames
const getFilename = (options = {}) => {
    const {
        type = 'json',
        isDetailed = false,
        timestamp = '',
        originalFilename = '',
    } = options;
    const timestampFormatted = timestamp
        ? new Date(timestamp).toISOString().replace(/[:.]/g, '-')
        : '';
    const serverName = toCapitalizedCase(currentServerName || 'DirectMessages'); // Capitalized without underscore
    const channelName = toCapitalizedCase(currentChannelName || 'Unknown_Channel');
    let filename = `${serverName}_${channelName}`;

    if (timestampFormatted) filename += `_${timestampFormatted}`;
    if (originalFilename) filename += `_${originalFilename}`;
    if (type === 'json')
        filename += isDetailed ? '_Detailed_Messages.json' : '_Messages.json';

    return filename;
};

// Generalized function to download files
const downloadFile = (content, filename, isBlob = false) => {
    const blob = isBlob
        ? content
        : new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = toCapitalizedCase(filename);
    link.click();
    URL.revokeObjectURL(url);
    console.log(`Downloaded ${filename}`);
};

// Function to fetch and process messages in batches
const fetchAllMessagesInBatches = async (
    channelId,
    formatLessDetails = false,
    getMedia = false,
    isDirectMessage = false // New flag for Direct Messages
) => {
    let lastMessageId = null;
    stopFetching = false;
    messagesArray.length = 0;
    pictureUrls.length = 0;

    // Reset currentServerName for Direct Messages
    if (isDirectMessage) {
        currentServerName = null; // Reset to ensure the filename defaults to DirectMessages
    }

    while (!stopFetching) {
        const batch = await fetchMessages(channelId, { before: lastMessageId });
        if (!batch.length) break;

        if (getMedia) {
            const mediaUrls = extractMediaUrls(batch);
            pictureUrls.push(...mediaUrls);
            console.log(`Fetched media URLs:`, mediaUrls);

            for (const { url, filename, timestamp } of mediaUrls) {
                try {
                    const response = await fetch(url, { mode: 'cors' });
                    if (response.ok) {
                        const blob = await response.blob();
                        if (blob.size > 0) {
                            const fullFilename = getFilename({
                                type: 'media',
                                timestamp,
                                originalFilename: filename,
                            });
                            downloadFile(blob, fullFilename, true);
                        } else {
                            console.error(`Empty file detected: ${filename}`);
                        }
                    } else {
                        console.error(`Failed to fetch ${url}: ${response.status}`);
                    }
                } catch (error) {
                    console.error(`Error downloading ${url}:`, error);
                }
            }
        } else {
            const formattedBatch = formatLessDetails
                ? formatMessagesLessDetails(batch)
                : batch;
            messagesArray.push(...formattedBatch);
            console.log(`Fetched messages batch:`, formattedBatch);
        }

        lastMessageId = batch[batch.length - 1]?.id;
    }

    console.log('Fetching stopped or completed.');
    if (!getMedia) {
        const filename = getFilename({ isDetailed: !formatLessDetails });
        downloadFile(messagesArray, filename);
    }
};

// Set up event listeners for the buttons
document.addEventListener('DOMContentLoaded', () => {
    const addClickListener = (id, callback) => {
        const element = document.getElementById(id);
        element?.addEventListener('click', () => {
            if (currentChannelId) callback();
            else console.warn('No channel selected.');
        });
    };

    addClickListener('get-all-messages', () =>
        fetchAllMessagesInBatches(currentChannelId, false, false, false) // Regular server messages
    );
    addClickListener('get-all-messages-less-details', () =>
        fetchAllMessagesInBatches(currentChannelId, true, false, false) // Regular server messages
    );
    addClickListener('get-all-pictures', () =>
        fetchAllMessagesInBatches(currentChannelId, false, true, false) // Regular server media
    );
    addClickListener('get-all-direct-messages', () =>
        fetchAllMessagesInBatches(currentChannelId, false, false, true) // Direct Messages
    );
    addClickListener('get-all-direct-messages-pictures', () =>
        fetchAllMessagesInBatches(currentChannelId, false, true, true) // Direct Message media
    );
    addClickListener('stop-getting-all-messages', () => {
        stopFetching = true;
    });
});
