// social.js - front-end hooks and dummy data with API placeholders

const API_BASE = '/api/social'; // backend hooks ready

async function fetchPosts() {
    // Placeholder for GET /api/social/posts
    // return fetch(`${API_BASE}/posts`).then(r=>r.json());
    return Promise.resolve(sampleData.posts);
}

async function fetchTrending() {
    // Calculate trending posts based on engagement (likes + comments)
    const posts = sampleData.posts.slice();
    posts.sort((a, b) => {
        const engagementA = a.likes + a.comments.length;
        const engagementB = b.likes + b.comments.length;
        return engagementB - engagementA;
    });
    return Promise.resolve(posts.slice(0, 5)); // Top 5 most engaged
}

async function fetchMostEngaged() {
    // Placeholder for GET /api/social/most-engaged
    return Promise.resolve(sampleData.mostEngaged);
}

async function createPost(formData) {
    // Placeholder for POST /api/social/create
    // return fetch(`${API_BASE}/create`, { method:'POST', body: formData });
    const newPost = {
        id: 'p' + Date.now(),
        user: { name: 'You', avatar: '../assets/images/M.yobby.jpg' },
        text: formData.get('text'),
        media: formData.get('media') ? URL.createObjectURL(formData.get('media')) : null,
        likes: 0,
        comments: []
    };
    sampleData.posts.unshift(newPost);
    return Promise.resolve(newPost);
}

async function likePost(id) {
    // Placeholder for POST /api/social/like/:id
    // return fetch(`${API_BASE}/like/${id}`, { method:'POST' });
    const p = sampleData.posts.find(x=>x.id===id);
    if (p) p.likes++;
    return Promise.resolve(p);
}

async function commentPost(id, comment) {
    // Placeholder for POST /api/social/comment/:id
    const p = sampleData.posts.find(x=>x.id===id);
    if (p) p.comments.push({ id:'c'+Date.now(), text:comment, user:{name:'Commenter'} });
    return Promise.resolve(p);
}

function renderPosts(posts) {
    const feed = document.getElementById('posts-feed');
    feed.innerHTML = '';
    posts.forEach(p => {
        const el = document.createElement('div');
        el.className = 'post card';
        el.innerHTML = `
            <div class="meta">
                <img src="${p.user.avatar}" alt="avatar">
                <div><strong>${p.user.name}</strong><div class="time">just now</div></div>
            </div>
            <div class="content">
                <p>${p.text || ''}</p>
                ${p.media ? (p.media.includes('video') ? `<video controls src="${p.media}" style="max-width:100%"></video>` : `<img src="${p.media}" style="max-width:100%">`) : ''}
            </div>
            <div class="actions">
                <button onclick="handleLike('${p.id}')"><i class="fas fa-heart"></i> Like (${p.likes})</button>
                <button onclick="toggleCommentBox('${p.id}')"><i class="fas fa-comment"></i> Comment (${p.comments.length})</button>
                <button onclick="handleMessage('${p.user.name}')"><i class="fas fa-envelope"></i> Message</button>
                <button onclick="handleShare('${p.id}')"><i class="fas fa-share"></i> Share</button>
            </div>
            <div class="comments" id="comments-${p.id}" style="display:none; margin-top:10px;"></div>
            <div class="comment-box" id="comment-box-${p.id}" style="display:none; margin-top:8px;">
                <input type="text" id="comment-input-${p.id}" placeholder="Write a comment...">
                <button onclick="submitComment('${p.id}')">Send</button>
            </div>
        `;
        feed.appendChild(el);
    });
}

function renderTrending(list) {
    const node = document.getElementById('trending-list');
    node.innerHTML = '';
    if (list.length === 0) {
        node.innerHTML = '<p style="color:#888;font-size:0.9rem;">No trending posts yet</p>';
        return;
    }
    list.forEach(post => {
        const engagement = post.likes + post.comments.length;
        const el = document.createElement('div');
        el.className = 'trending-post';
        el.style.cssText = 'padding:10px;border-bottom:1px solid #eee;cursor:pointer;';
        el.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <img src="${post.user.avatar}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">
                <strong style="font-size:0.9rem;">${post.user.name}</strong>
            </div>
            <p style="margin:4px 0;font-size:0.9rem;color:#555;">${post.text ? (post.text.length > 60 ? post.text.substring(0, 60) + '...' : post.text) : 'Post with media'}</p>
            <div style="display:flex;gap:12px;font-size:0.85rem;color:#888;">
                <span><i class="fas fa-heart"></i> ${post.likes}</span>
                <span><i class="fas fa-comment"></i> ${post.comments.length}</span>
                <span><i class="fas fa-fire"></i> ${engagement} engagement</span>
            </div>
        `;
        node.appendChild(el);
    });
}

function renderMostEngaged(list) {
    const node = document.getElementById('engaged-list');
    if (!node) return; // Element doesn't exist anymore
    node.innerHTML = '';
    list.forEach(u => {
        const li = document.createElement('li');
        li.innerHTML = `<img src="${u.avatar}" style="width:40px;height:40px;border-radius:50%"><div><strong>${u.name}</strong><div>Score: ${u.score}</div></div>`;
        node.appendChild(li);
    });
}

// sample data (no placeholders - starts empty)
const sampleData = {
    posts: [],
    trending: [],
    mostEngaged:[]
};

// UI handlers
async function initSocial() {
    const posts = await fetchPosts();
    renderPosts(posts);
    renderTrending(await fetchTrending());
    renderMostEngaged(await fetchMostEngaged());
}

async function handleLike(id) {
    await likePost(id);
    renderPosts(sampleData.posts);
}

// Make functions globally available
window.handleLike = handleLike;
window.handleMessage = handleMessage;
window.handleShare = handleShare;
window.toggleCommentBox = toggleCommentBox;
window.submitComment = submitComment;

function toggleCommentBox(id) {
    const box = document.getElementById('comment-box-'+id);
    const commentsContainer = document.getElementById('comments-'+id);
    const post = sampleData.posts.find(p => p.id === id);
    
    if (box.style.display === 'none') {
        box.style.display = 'flex';
        commentsContainer.style.display = 'block';
        
        // Render existing comments
        if (post && post.comments.length > 0) {
            commentsContainer.innerHTML = '';
            post.comments.forEach(comment => {
                const commentEl = document.createElement('div');
                commentEl.style.cssText = 'padding:8px;background:#f8f9fa;border-radius:6px;margin-bottom:6px;';
                commentEl.innerHTML = `
                    <strong style="font-size:0.9rem;">${comment.user.name}</strong>
                    <p style="margin:4px 0 0 0;font-size:0.9rem;">${comment.text}</p>
                `;
                commentsContainer.appendChild(commentEl);
            });
        } else {
            commentsContainer.innerHTML = '<p style="color:#888;font-size:0.85rem;padding:8px;">No comments yet. Be the first to comment!</p>';
        }
    } else {
        box.style.display = 'none';
        commentsContainer.style.display = 'none';
    }
}

async function submitComment(id) {
    const input = document.getElementById('comment-input-'+id);
    if (!input.value) return;
    await commentPost(id, input.value);
    input.value='';
    // Re-render posts and trending to update engagement
    renderPosts(sampleData.posts);
    renderTrending(await fetchTrending());
}

function handleMessage(userName) {
    // Simple messaging interface
    const message = prompt(`Send a message to ${userName}:`);
    if (message && message.trim()) {
        alert(`Message sent to ${userName}:\n"${message}"\n\n(In production, this would use real-time messaging)`);
        // TODO: Implement real messaging API
        // fetch('/api/messages', { method: 'POST', body: JSON.stringify({ to: userName, message }) })
    }
}

function handleShare(id) {
    // placeholder for share behavior (POST /api/social/share/:id)
    alert('Share link copied to clipboard (placeholder)');
}

// form handling
document.addEventListener('DOMContentLoaded', ()=>{
    const postForm = document.getElementById('post-form');
    const mediaInput = document.getElementById('post-media');
    const fileSizeError = document.getElementById('file-size-error');
    
    // File size validation (10MB limit)
    if (mediaInput) {
        mediaInput.addEventListener('change', function() {
            const file = this.files[0];
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            
            if (file && file.size > maxSize) {
                fileSizeError.style.display = 'inline';
                this.value = ''; // Clear the file
                setTimeout(() => {
                    fileSizeError.style.display = 'none';
                }, 3000);
            }
        });
    }
    
    if (postForm) {
        postForm.addEventListener('submit', async (e)=>{
            e.preventDefault();
            const text = document.getElementById('post-text').value;
            const mediaInput = document.getElementById('post-media');
            
            // Check file size before submitting
            if (mediaInput.files[0]) {
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (mediaInput.files[0].size > maxSize) {
                    fileSizeError.style.display = 'inline';
                    setTimeout(() => {
                        fileSizeError.style.display = 'none';
                    }, 3000);
                    return;
                }
            }
            
            const fd = new FormData();
            fd.append('text', text);
            if (mediaInput.files[0]) fd.append('media', mediaInput.files[0]);
            await createPost(fd);
            document.getElementById('post-text').value='';
            if (mediaInput) mediaInput.value='';
            renderPosts(sampleData.posts);
        });
    }
    // init page content
    if (window.location.pathname.endsWith('social.html') || window.location.href.includes('social.html')) {
        initSocial();
    }
});
