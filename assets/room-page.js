(function () {
  const shared = window.PyteApp;

  if (!shared || !document.getElementById("roomCodeInput")) {
    return;
  }

  const {
    clearRoomSession,
    copyText,
    createStatusController,
    getDefaultRoomServerUrl,
    getClientToken,
    getQueryParam,
    loadRoomSession,
    loadRoomServerUrl,
    normalizeRoomServerUrl,
    saveRoomSession,
    saveRoomServerUrl,
    setPanelState
  } = shared;

  const refs = {
    pageStatus: document.getElementById("pageStatus"),
    roomHeadline: document.getElementById("roomHeadline"),
    roomCodeInput: document.getElementById("roomCodeInput"),
    roomServerInput: document.getElementById("roomServerInput"),
    connectRoomServerButton: document.getElementById("connectRoomServerButton"),
    useSameSiteButton: document.getElementById("useSameSiteButton"),
    copyInviteButton: document.getElementById("copyInviteButton"),
    checkRoomButton: document.getElementById("checkRoomButton"),
    joinRoomButton: document.getElementById("joinRoomButton"),
    leaveRoomButton: document.getElementById("leaveRoomButton"),
    roomNotice: document.getElementById("roomNotice"),
    participantList: document.getElementById("participantList"),
    identityOptionAngel: document.getElementById("identityOptionAngel"),
    identityOptionBeloved: document.getElementById("identityOptionBeloved"),
    sessionScorePanel: document.getElementById("sessionScorePanel"),
    sessionAngelPoints: document.getElementById("sessionAngelPoints"),
    sessionBelovedPoints: document.getElementById("sessionBelovedPoints"),
    sessionRoundStatus: document.getElementById("sessionRoundStatus"),
    challengePhasePill: document.getElementById("challengePhasePill"),
    startChallengeButton: document.getElementById("startChallengeButton"),
    roomChallengeTitle: document.getElementById("roomChallengeTitle"),
    roomChallengeMeta: document.getElementById("roomChallengeMeta"),
    roomChallengePrompt: document.getElementById("roomChallengePrompt"),
    roomChallengeCode: document.getElementById("roomChallengeCode"),
    roomChallengeChoices: document.getElementById("roomChallengeChoices"),
    challengeAnswerInput: document.getElementById("challengeAnswerInput"),
    submitChallengeAnswerButton: document.getElementById("submitChallengeAnswerButton"),
    challengeResultSummary: document.getElementById("challengeResultSummary"),
    toggleRoundHistoryButton: document.getElementById("toggleRoundHistoryButton"),
    roundHistoryPanel: document.getElementById("roundHistoryPanel"),
    roundHistoryList: document.getElementById("roundHistoryList"),
    chatMessages: document.getElementById("chatMessages"),
    chatInput: document.getElementById("chatInput"),
    sendChatButton: document.getElementById("sendChatButton")
  };

  const state = {
    socket: null,
    socketPhase: typeof window.io === "function" ? "connecting" : "offline",
    socketUrl: loadRoomServerUrl(),
    roomSession: loadRoomSession(),
    currentRoomState: null,
    roundHistoryOpen: false,
    lastRenderedRoundId: ""
  };

  const status = createStatusController(refs.pageStatus, () => {
    if (state.socketPhase === "offline") {
      return { message: "Offline", mode: "error" };
    }

    if (state.socketPhase === "connecting") {
      return { message: "Connecting...", mode: "loading" };
    }

    if (isLiveRoomConnected(state.currentRoomState)) {
      return { message: "Live room connected", mode: "ready" };
    }

    return { message: "Ready", mode: "ready" };
  });

  function activeRoomId() {
    return String(refs.roomCodeInput.value || "").trim().toUpperCase();
  }

  function emptyRoomState(roomId = "") {
    return {
      roomId,
      availableIdentities: ["Angel", "Beloved"],
      roomFull: false,
      participants: [
        { identity: "Angel", status: "open", connected: false, joinedAt: null },
        { identity: "Beloved", status: "open", connected: false, joinedAt: null }
      ],
      chat: [],
      sessionScores: {
        Angel: 0,
        Beloved: 0
      },
      roundHistory: [],
      activeChallenge: null,
      roomStatus: "waiting_for_players"
    };
  }

  function isLiveRoomConnected(roomState) {
    return Boolean(
      roomState &&
        Array.isArray(roomState.participants) &&
        roomState.participants.length === 2 &&
        roomState.participants.every((participant) => participant.status === "connected")
    );
  }

  function shouldShowSessionScore(roomState) {
    return Boolean(roomState && (isLiveRoomConnected(roomState) || roomState.activeChallenge));
  }

  function getSelectedIdentity() {
    const checked = document.querySelector('input[name="identity"]:checked');
    return checked ? checked.value : "Angel";
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) {
      return "";
    }

    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function formatParticipantStatus(participant) {
    if (participant.status === "connected") {
      return "Connected";
    }

    if (participant.status === "reconnecting") {
      return "Reconnecting";
    }

    return "Available";
  }

  function formatRoomStatus(statusKey) {
    if (statusKey === "ready") {
      return "Both players are here. Session points are now live.";
    }

    if (statusKey === "challenge_active") {
      return "Challenge live. Each player gets one answer this round.";
    }

    if (statusKey === "round_complete") {
      return "Round complete. Start a fresh one when you're ready.";
    }

    return "Points appear once both players are active together.";
  }

  function setIdentityAvailability(roomState) {
    const room = roomState || emptyRoomState();
    const options = [
      { identity: "Angel", element: refs.identityOptionAngel },
      { identity: "Beloved", element: refs.identityOptionBeloved }
    ];

    for (const option of options) {
      const input = option.element.querySelector("input");
      const isJoinedIdentity = state.roomSession && state.roomSession.identity === option.identity;
      const available = room.availableIdentities.includes(option.identity) || isJoinedIdentity;
      input.disabled = !available || Boolean(state.roomSession && !isJoinedIdentity);
      option.element.setAttribute("aria-disabled", String(input.disabled));
    }
  }

  function renderParticipants(roomState) {
    refs.participantList.innerHTML = "";
    const nextRoom = roomState || emptyRoomState();

    for (const participant of nextRoom.participants) {
      const chip = document.createElement("div");
      chip.className = `participant-chip ${participant.status}`;

      const name = document.createElement("span");
      name.className = "participant-name";
      name.textContent = participant.identity;

      const statusText = document.createElement("span");
      statusText.className = "participant-state";
      statusText.textContent = formatParticipantStatus(participant);

      chip.append(name, statusText);
      refs.participantList.appendChild(chip);
    }

    refs.roomHeadline.textContent = nextRoom.roomId ? `Room ${nextRoom.roomId}` : "Not in a room";
  }

  function appendMessageLine(container, text) {
    const line = document.createElement("div");
    line.textContent = text;
    container.appendChild(line);
  }

  function renderChat(messages) {
    refs.chatMessages.innerHTML = "";

    if (!messages || !messages.length) {
      const placeholder = document.createElement("div");
      placeholder.className = "message system";
      placeholder.textContent = "Messages between Angel and Beloved will show here.";
      refs.chatMessages.appendChild(placeholder);
      return;
    }

    for (const message of messages) {
      const item = document.createElement("article");
      item.className = `message ${message.kind === "system" ? "system" : message.identity.toLowerCase()}`;

      const head = document.createElement("div");
      head.className = "message-head";

      const name = document.createElement("span");
      name.className = "message-name";
      name.textContent = message.kind === "system" ? "System" : message.identity;

      const time = document.createElement("span");
      time.textContent = formatTimestamp(message.createdAt);

      head.append(name, time);

      const body = document.createElement("div");
      body.className = "message-body";
      body.textContent = message.kind === "system" ? message.text : `${message.identity}: ${message.text}`;

      item.append(head, body);
      refs.chatMessages.appendChild(item);
    }

    refs.chatMessages.scrollTop = refs.chatMessages.scrollHeight;
  }

  function renderRoundHistory(history) {
    refs.roundHistoryList.innerHTML = "";

    if (!history || !history.length) {
      const placeholder = document.createElement("div");
      placeholder.className = "history-item";
      placeholder.textContent = "No rounds yet.";
      refs.roundHistoryList.appendChild(placeholder);
      return;
    }

    for (const item of history) {
      const card = document.createElement("article");
      card.className = "history-item";

      const title = document.createElement("strong");
      title.textContent = item.challenge.title;

      const summary = document.createElement("div");
      summary.className = "history-summary";
      summary.textContent = item.results
        .map((result) => `${result.identity}: ${result.correct ? "correct" : "wrong"} (+${result.pointsAwarded})`)
        .join(" | ");

      const note = document.createElement("div");
      note.className = "subtle-line";
      note.textContent = item.explanation || "";

      card.append(title, summary, note);
      refs.roundHistoryList.appendChild(card);
    }
  }

  function renderChallengeChoices(choices) {
    refs.roomChallengeChoices.innerHTML = "";

    for (const choice of choices || []) {
      const item = document.createElement("div");
      item.className = "choice-item";
      item.textContent = `${choice.id}: ${choice.text}`;
      refs.roomChallengeChoices.appendChild(item);
    }
  }

  function renderChallenge(roomState) {
    const active = roomState?.activeChallenge;
    const myIdentity = state.roomSession?.identity || "";
    const mySubmission = active && myIdentity ? active.submissions?.[myIdentity] : null;
    const canStart =
      Boolean(state.roomSession) &&
      Boolean(roomState) &&
      roomState.roomStatus !== "challenge_active" &&
      Array.isArray(roomState.participants) &&
      roomState.participants.every((participant) => participant.status === "connected");

    refs.startChallengeButton.disabled = !canStart;
    refs.challengeAnswerInput.disabled = true;
    refs.submitChallengeAnswerButton.disabled = true;

    if (!active) {
      state.lastRenderedRoundId = "";
      refs.challengePhasePill.textContent = "Waiting";
      refs.roomChallengeTitle.textContent = "No live challenge yet";
      refs.roomChallengeMeta.textContent = "Both players need to be connected before a round can begin.";
      refs.roomChallengePrompt.textContent = "";
      refs.roomChallengeCode.hidden = true;
      refs.roomChallengeCode.textContent = "";
      refs.challengeAnswerInput.value = "";
      refs.challengeAnswerInput.placeholder = "Type your answer here.";
      refs.challengeResultSummary.textContent = "Challenge results will appear here after the round ends.";
      renderChallengeChoices([]);
      return;
    }

    if (active.roundId !== state.lastRenderedRoundId) {
      refs.challengeAnswerInput.value = "";
      state.lastRenderedRoundId = active.roundId;
    }

    refs.challengePhasePill.textContent = active.status === "active" ? "Live now" : "Round done";
    refs.roomChallengeTitle.textContent = active.challenge.title;
    refs.roomChallengeMeta.textContent = `${active.challenge.type} | ${active.challenge.difficulty} | ${active.challenge.points} pts`;
    refs.roomChallengePrompt.textContent = active.challenge.prompt;
    refs.challengeAnswerInput.placeholder = active.challenge.answerPlaceholder || "Type your answer here.";

    if (active.challenge.code) {
      refs.roomChallengeCode.hidden = false;
      refs.roomChallengeCode.textContent = active.challenge.code;
    } else {
      refs.roomChallengeCode.hidden = true;
      refs.roomChallengeCode.textContent = "";
    }

    renderChallengeChoices(active.challenge.choices || []);

    if (active.status === "active") {
      refs.challengeAnswerInput.disabled = !state.roomSession || Boolean(mySubmission?.submitted);
      refs.submitChallengeAnswerButton.disabled = !state.roomSession || Boolean(mySubmission?.submitted);
      refs.challengeResultSummary.textContent = mySubmission?.submitted
        ? `${myIdentity} already submitted. Waiting for the other player or the round result.`
        : "Both players see the same prompt. Submit once to lock in your answer.";
      return;
    }

    const summary = active.results
      .map((result) => `${result.identity}: ${result.correct ? "correct" : "wrong"}, +${result.pointsAwarded}`)
      .join(" | ");

    refs.challengeResultSummary.textContent = active.explanation
      ? `${summary} | ${active.explanation}`
      : summary;
  }

  function syncRoomControls() {
    const inRoom = Boolean(state.roomSession);
    const connected = state.socketPhase === "connected";
    refs.roomCodeInput.disabled = inRoom;
    refs.checkRoomButton.disabled = !connected;
    refs.joinRoomButton.disabled = !connected || !activeRoomId() || inRoom;
    refs.leaveRoomButton.disabled = !inRoom;
    refs.chatInput.disabled = !inRoom;
    refs.sendChatButton.disabled = !inRoom;
    refs.connectRoomServerButton.disabled = false;
    refs.useSameSiteButton.disabled = false;
    refs.copyInviteButton.disabled = !activeRoomId();
  }

  function renderRoomState(roomState) {
    const nextRoom = roomState || emptyRoomState(activeRoomId());
    state.currentRoomState = nextRoom;
    renderParticipants(nextRoom);
    setIdentityAvailability(nextRoom);
    refs.sessionScorePanel.hidden = !shouldShowSessionScore(nextRoom);
    refs.sessionAngelPoints.textContent = String(nextRoom.sessionScores?.Angel ?? 0);
    refs.sessionBelovedPoints.textContent = String(nextRoom.sessionScores?.Beloved ?? 0);
    refs.sessionRoundStatus.textContent = formatRoomStatus(nextRoom.roomStatus);
    refs.roomNotice.textContent = nextRoom.roomFull && !state.roomSession
      ? `${nextRoom.roomId} is full right now.`
      : nextRoom.roomStatus === "challenge_active"
        ? "Challenge live now. Each player gets one answer."
        : isLiveRoomConnected(nextRoom)
          ? "Both players are here. Start a round when you are ready."
          : nextRoom.availableIdentities?.length
            ? `Available right now: ${nextRoom.availableIdentities.join(" and ")}`
            : "Both names are in use right now.";
    renderChallenge(nextRoom);
    renderChat(nextRoom.chat || []);
    renderRoundHistory(nextRoom.roundHistory || []);
    syncRoomControls();
    status.render();
  }

  function setRoomServerInputValue(value) {
    refs.roomServerInput.value = value === getDefaultRoomServerUrl() ? "" : value;
  }

  function emitWithAck(eventName, payload = {}) {
    return new Promise((resolve) => {
      if (!state.socket || state.socketPhase !== "connected") {
        resolve({
          ok: false,
          message: "The live room is offline right now."
        });
        return;
      }

      state.socket.emit(eventName, payload, (response) => {
        resolve(response || { ok: false, message: "The live room did not reply." });
      });
    });
  }

  async function previewRoom() {
    const result = await emitWithAck("room:preview", {
      roomId: activeRoomId()
    });

    if (!result.ok) {
      refs.roomNotice.textContent = result.message || "Could not preview that room right now.";
      return;
    }

    refs.roomCodeInput.value = result.roomId;
    renderRoomState(result.state);
  }

  async function joinRoom(options = {}) {
    const roomId = activeRoomId();
    const identity = options.auto && state.roomSession ? state.roomSession.identity : getSelectedIdentity();
    const result = await emitWithAck("room:join", {
      roomId,
      identity,
      sessionToken: getClientToken()
    });

    if (!result.ok) {
      refs.roomNotice.textContent = result.message || "Could not join that room right now.";
      if (result.state) {
        renderRoomState(result.state);
      }
      return;
    }

    state.roomSession = saveRoomSession(result.roomId, identity);
    refs.roomCodeInput.value = result.roomId;
    renderRoomState(result.state);
    refs.roomNotice.textContent = `You joined ${result.roomId} as ${identity}.`;
    status.flash("Joined live room.", "ready");
  }

  async function leaveRoom() {
    await emitWithAck("room:leave");
    clearRoomSession();
    state.roomSession = null;
    refs.chatInput.value = "";
    refs.challengeAnswerInput.value = "";
    renderRoomState(emptyRoomState(activeRoomId()));
    refs.roomNotice.textContent = "You left the room.";
    status.flash("Left room.", "ready");
  }

  async function sendChatMessage() {
    const text = refs.chatInput.value.trim();

    if (!text) {
      refs.roomNotice.textContent = "Type a message before sending.";
      status.flash("Add a message first.", "warning");
      return;
    }

    const result = await emitWithAck("chat:send", { text });

    if (!result.ok) {
      refs.roomNotice.textContent = result.message || "That message could not be sent.";
      status.flash("Message not sent.", "warning");
      return;
    }

    refs.chatInput.value = "";
  }

  async function startChallenge() {
    const result = await emitWithAck("challenge:start");

    if (!result.ok) {
      refs.challengeResultSummary.textContent = result.message || "Challenge could not start.";
      status.flash("Challenge not started.", "warning");
      return;
    }

    status.flash("Challenge started.", "ready");
  }

  async function submitChallengeAnswer() {
    const answer = refs.challengeAnswerInput.value.trim();

    if (!answer) {
      refs.challengeResultSummary.textContent = "Type an answer before submitting.";
      status.flash("Add an answer first.", "warning");
      return;
    }

    const result = await emitWithAck("challenge:submit", { answer });

    if (!result.ok) {
      refs.challengeResultSummary.textContent = result.message || "Answer could not be submitted.";
      status.flash("Answer not submitted.", "warning");
      return;
    }

    refs.challengeAnswerInput.value = "";
  }

  function toggleRoundHistory() {
    state.roundHistoryOpen = !state.roundHistoryOpen;
    setPanelState(
      refs.toggleRoundHistoryButton,
      refs.roundHistoryPanel,
      state.roundHistoryOpen,
      "Hide recent rounds",
      "Show recent rounds"
    );
  }

  function closeSocket() {
    if (!state.socket) {
      return;
    }

    state.socket.removeAllListeners();
    state.socket.disconnect();
    state.socket = null;
  }

  function resetRoomSurface(message) {
    if (state.roomSession) {
      clearRoomSession();
      state.roomSession = null;
    }

    renderRoomState(emptyRoomState(activeRoomId()));
    if (message) {
      refs.roomNotice.textContent = message;
    }
  }

  async function connectRoomServer(options = {}) {
    const normalized = saveRoomServerUrl(refs.roomServerInput.value);
    state.socketUrl = normalized;
    setRoomServerInputValue(normalized);

    if (options.resetSession) {
      resetRoomSurface("Room connection changed. Join again when you're ready.");
    }

    closeSocket();
    state.socketPhase = "connecting";
    status.render();
    bootSocket();
  }

  async function useSameSiteServer() {
    refs.roomServerInput.value = "";
    await connectRoomServer({ resetSession: true });
    status.flash("Using this site for the live room.", "ready");
  }

  async function copyInviteLink() {
    const roomId = activeRoomId();

    if (!roomId) {
      status.flash("Add a room code first.", "warning");
      return;
    }

    const inviteUrl = new URL("./room.html", window.location.href);
    inviteUrl.searchParams.set("room", roomId);

    if (state.socketUrl && state.socketUrl !== window.location.origin) {
      inviteUrl.searchParams.set("server", state.socketUrl);
    }

    const copied = await copyText(inviteUrl.toString());
    status.flash(copied ? "Invite link copied." : "Could not copy the invite link.", copied ? "ready" : "warning");
  }

  function bootSocket() {
    if (typeof window.io !== "function") {
      state.socketPhase = "offline";
      refs.roomNotice.textContent = "Live room is unavailable right now, but the practice and solo pages still work.";
      renderRoomState(emptyRoomState(activeRoomId()));
      return;
    }

    const socketOrigin = state.socketUrl || getDefaultRoomServerUrl();

    state.socket = window.io(socketOrigin, {
      transports: ["websocket", "polling"],
      reconnection: true,
      timeout: 12000
    });

    state.socket.on("connect", async () => {
      state.socketPhase = "connected";
      status.render();

      if (state.roomSession) {
        refs.roomCodeInput.value = state.roomSession.roomId;
        const savedIdentity = document.querySelector(`input[name="identity"][value="${state.roomSession.identity}"]`);

        if (savedIdentity) {
          savedIdentity.checked = true;
        }

        await joinRoom({ auto: true });
        return;
      }

      if (activeRoomId()) {
        await previewRoom();
        return;
      }

      renderRoomState(emptyRoomState());
    });

    state.socket.on("disconnect", () => {
      state.socketPhase = "connecting";
      status.render();
      syncRoomControls();
    });

    state.socket.on("connect_error", () => {
      state.socketPhase = "offline";
      refs.roomNotice.textContent = `Room connection is unavailable right now. Check the Room Server and try again.`;
      status.render();
      syncRoomControls();
    });

    state.socket.on("socket:status", (payload) => {
      state.socketPhase = payload.connected ? "connected" : "connecting";
      status.render();
    });

    state.socket.on("room:state", (roomState) => {
      renderRoomState(roomState);
    });
  }

  refs.checkRoomButton.addEventListener("click", previewRoom);
  refs.joinRoomButton.addEventListener("click", () => joinRoom());
  refs.leaveRoomButton.addEventListener("click", leaveRoom);
  refs.connectRoomServerButton.addEventListener("click", () => connectRoomServer({ resetSession: true }));
  refs.useSameSiteButton.addEventListener("click", useSameSiteServer);
  refs.copyInviteButton.addEventListener("click", copyInviteLink);
  refs.sendChatButton.addEventListener("click", sendChatMessage);
  refs.startChallengeButton.addEventListener("click", startChallenge);
  refs.submitChallengeAnswerButton.addEventListener("click", submitChallengeAnswer);
  refs.toggleRoundHistoryButton.addEventListener("click", toggleRoundHistory);
  refs.roomCodeInput.addEventListener("input", syncRoomControls);
  refs.roomServerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      connectRoomServer({ resetSession: true });
    }
  });
  refs.chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  });

  const queryRoom = getQueryParam("room");
  if (queryRoom) {
    refs.roomCodeInput.value = queryRoom.trim().toUpperCase();
  }
  setRoomServerInputValue(state.socketUrl);

  setPanelState(
    refs.toggleRoundHistoryButton,
    refs.roundHistoryPanel,
    state.roundHistoryOpen,
    "Hide recent rounds",
    "Show recent rounds"
  );
  renderRoomState(emptyRoomState());
  bootSocket();
  syncRoomControls();
  status.render();
})();
