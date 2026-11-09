const serviceName = "올바른 자세 가이드";
const menuToggle = document.querySelector("#menu-toggle");
const primaryMenu = document.querySelector("#primary-menu");
const primaryMenuLinks = primaryMenu.querySelectorAll("a");
const mobileMenuQuery = window.matchMedia("(max-width: 768px)");

function setMenuExpanded(isExpanded) {
    primaryMenu.hidden = !isExpanded;
    menuToggle.setAttribute("aria-expanded", String(isExpanded));
    menuToggle.textContent = isExpanded ? "메뉴 닫기" : "메뉴 열기";
}

function updateMenuForViewport() {
    setMenuExpanded(!mobileMenuQuery.matches);
}

function updateCurrentMenu() {
    const currentHash = window.location.hash || "#about";
    const currentLink = Array.from(primaryMenuLinks).find((link) => link.hash === currentHash)
        || primaryMenuLinks[0];

    primaryMenuLinks.forEach((link) => {
        if (link === currentLink) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

menuToggle.addEventListener("click", () => {
    setMenuExpanded(menuToggle.getAttribute("aria-expanded") !== "true");
});
primaryMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
        if (mobileMenuQuery.matches) setMenuExpanded(false);
    });
});
mobileMenuQuery.addEventListener("change", updateMenuForViewport);
window.addEventListener("hashchange", updateCurrentMenu);
window.addEventListener("popstate", updateCurrentMenu);
updateMenuForViewport();
updateCurrentMenu();

const recordsList = document.querySelector("#records-list");
const recordsCount = document.querySelector("#records-count");
const recordsMessage = document.querySelector("#records-message");
const recordFilters = document.querySelectorAll(".record-filter");
const initialExerciseItems = [
    {
        id: "sitting-posture",
        title: "의자에 앉을 때 골반 위치 확인하기",
        category: "기본 자세",
        duration: "3분",
        description: "엉덩이를 의자 안쪽까지 넣고 양발을 바닥에 편안히 둡니다.",
        status: "ready"
    },
    {
        id: "screen-height",
        title: "화면 높이와 시선 맞추기",
        category: "책상 환경",
        duration: "5분",
        description: "화면 상단이 눈높이에 오도록 조정하고 목을 곧게 세웁니다.",
        status: "ready"
    },
    {
        id: "shoulder-stretch",
        title: "목과 어깨 가볍게 풀기",
        category: "스트레칭",
        duration: "3분",
        description: "통증이 없는 범위에서 어깨를 천천히 돌리고 목 옆을 늘립니다.",
        status: "ready"
    },
    {
        id: "posture-habit",
        title: "1분 자세 점검 습관 만들기",
        category: "습관 만들기",
        duration: "1분",
        description: "한 시간에 한 번 자세를 점검할 알림을 정하고 바른 자세를 확인합니다.",
        status: "ready"
    }
];
let exerciseItems = initialExerciseItems.map((item) => ({ ...item }));
let activeRecordFilter = "all";

function isExerciseItem(item) {
    return item && typeof item.id === "string"
        && typeof item.title === "string"
        && typeof item.category === "string"
        && typeof item.duration === "string"
        && typeof item.description === "string"
        && (item.status === "ready" || item.status === "complete");
}

try {
    const savedItems = localStorage.getItem("postureExerciseItems");
    if (savedItems !== null) {
        const parsedItems = JSON.parse(savedItems);
        if (!Array.isArray(parsedItems) || !parsedItems.every(isExerciseItem)) {
            throw new Error("저장된 연습 목록의 형식이 올바르지 않습니다.");
        }
        exerciseItems = parsedItems;
    }
} catch (error) {
    recordsMessage.textContent = "저장된 연습 목록을 불러오지 못했습니다. 기본 연습 목록을 표시합니다.";
    recordsMessage.classList.add("is-error");
}

function persistExerciseItems() {
    try {
        localStorage.setItem("postureExerciseItems", JSON.stringify(exerciseItems));
        return true;
    } catch (error) {
        recordsMessage.textContent = "변경 내용을 브라우저에 저장하지 못했습니다. 저장 공간을 확인해 주세요.";
        recordsMessage.classList.add("is-error");
        return false;
    }
}

function renderExerciseItems() {
    const visibleItems = exerciseItems.filter((item) => (
        activeRecordFilter === "all" || item.status === activeRecordFilter
    ));
    recordsList.replaceChildren();
    recordsCount.textContent = `${visibleItems.length}개의 연습 항목을 표시하고 있습니다.`;

    if (visibleItems.length === 0) {
        recordsMessage.textContent = exerciseItems.length === 0
            ? "아직 등록된 연습 항목이 없습니다. 훈련 설정을 완료하면 이곳에 표시됩니다."
            : "선택한 진행 상태의 항목이 없습니다. 다른 필터를 선택해 보세요.";
        recordsMessage.classList.remove("is-error");
        return;
    }

    if (!recordsMessage.classList.contains("is-error")) recordsMessage.textContent = "";
    visibleItems.forEach((item, index) => {
        const listItem = document.createElement("li");
        listItem.className = "record-card";

        const heading = document.createElement("h3");
        heading.textContent = item.title;
        const metadata = document.createElement("p");
        metadata.className = "record-metadata";
        const categoryAndDuration = document.createElement("span");
        categoryAndDuration.textContent = `${item.category} · ${item.duration}`;
        const statusLabel = document.createElement("span");
        statusLabel.className = `record-status-label is-${item.status}`;
        statusLabel.textContent = item.status === "complete" ? "연습 완료" : "연습 전";
        metadata.append(categoryAndDuration, statusLabel);

        const detail = document.createElement("p");
        detail.id = `record-detail-${index}`;
        detail.className = "record-detail";
        detail.textContent = item.description;
        detail.hidden = true;

        const actions = document.createElement("div");
        actions.className = "record-actions";
        const detailButton = document.createElement("button");
        detailButton.type = "button";
        detailButton.textContent = "상세 보기";
        detailButton.setAttribute("aria-expanded", "false");
        detailButton.setAttribute("aria-controls", detail.id);
        detailButton.addEventListener("click", () => {
            const isExpanded = detailButton.getAttribute("aria-expanded") === "true";
            detail.hidden = isExpanded;
            detailButton.setAttribute("aria-expanded", String(!isExpanded));
            detailButton.textContent = isExpanded ? "상세 보기" : "상세 숨기기";
        });

        const statusButton = document.createElement("button");
        statusButton.type = "button";
        statusButton.className = "record-status-button";
        statusButton.textContent = item.status === "complete" ? "연습 전으로 변경" : "연습 완료 표시";
        statusButton.addEventListener("click", () => {
            const nextStatus = item.status === "complete" ? "ready" : "complete";
            exerciseItems = exerciseItems.map((record) => (
                record.id === item.id ? { ...record, status: nextStatus } : record
            ));
            const saved = persistExerciseItems();
            renderExerciseItems();
            if (saved) {
                recordsMessage.textContent = nextStatus === "complete"
                    ? "연습 완료 상태를 저장했습니다."
                    : "연습 전 상태를 저장했습니다.";
            }
        });

        actions.append(detailButton, statusButton);
        listItem.append(heading, metadata, detail, actions);
        recordsList.append(listItem);
    });
}

recordFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
        activeRecordFilter = filter.dataset.status;
        recordFilters.forEach((button) => {
            const isSelected = button === filter;
            button.classList.toggle("is-active", isSelected);
            button.setAttribute("aria-pressed", String(isSelected));
        });
        renderExerciseItems();
    });
});
renderExerciseItems();

const subscribeForm = document.querySelector("#subscribe-form");
const subscriberNameInput = document.querySelector("#subscriber-name");
const emailInput = document.querySelector("#email");
const interestInput = document.querySelector("#interest");
const consultationRequest = document.querySelector("#consultation-request");
const consultationFields = document.querySelector("#consultation-fields");
const phoneInput = document.querySelector("#phone");
const contactTimeInput = document.querySelector("#contact-time");
const subscribeButton = document.querySelector("#subscribeButton");
const subscribeResetButton = document.querySelector("#subscribe-reset");
const subscribeMessage = document.querySelector("#subscribeMessage");
const nameCount = document.querySelector("#name-count");
const hasSubmittedForm = { value: false };

const formFields = [
    { input: subscriberNameInput, error: document.querySelector("#name-error") },
    { input: emailInput, error: document.querySelector("#email-error") },
    { input: interestInput, error: document.querySelector("#interest-error") },
    { input: phoneInput, error: document.querySelector("#phone-error") },
    { input: contactTimeInput, error: document.querySelector("#contact-time-error") }
];

function getFieldError(input) {
    if (!input.required && input.value.trim() === "") return "";
    if (input.validity.valueMissing) return "필수 항목입니다. 내용을 입력하거나 선택해 주세요.";
    if (input === subscriberNameInput && input.value.trim().length < 2) {
        return "이름은 공백을 제외하고 2자 이상 입력해 주세요.";
    }
    if (input === emailInput && input.validity.typeMismatch) {
        return "이메일 형식이 올바르지 않습니다. 예: name@example.com";
    }
    if (input === phoneInput && input.validity.patternMismatch) {
        return "휴대전화 번호를 010-1234-5678 형식으로 입력해 주세요.";
    }
    return "";
}

function updateFieldState(field) {
    const errorMessage = getFieldError(field.input);
    const shouldShowError = hasSubmittedForm.value || field.input.value.trim() !== "";
    field.error.textContent = shouldShowError ? errorMessage : "";
    field.input.setAttribute("aria-invalid", String(Boolean(shouldShowError && errorMessage)));
}

function updateNameCount() {
    const length = subscriberNameInput.value.trim().length;
    const requirement = length >= 2 ? "최소 글자 수 충족" : "최소 2자 필요";
    nameCount.textContent = `${subscriberNameInput.value.length} / 10자 · ${requirement}`;
}

function updateConsultationFields() {
    const enabled = consultationRequest.checked;
    consultationFields.hidden = !enabled;
    consultationFields.disabled = !enabled;
    phoneInput.required = enabled;
    contactTimeInput.required = enabled;
    if (enabled) {
        formFields.slice(3).forEach(updateFieldState);
    } else {
        formFields.slice(3).forEach((field) => {
            field.error.textContent = "";
            field.input.removeAttribute("aria-invalid");
        });
    }
}

function validateSubscribeForm() {
    const invalidFields = formFields.filter((field) => {
        if (field.input.disabled) return false;
        updateFieldState(field);
        return Boolean(getFieldError(field.input));
    });

    if (invalidFields.length > 0) {
        subscribeMessage.textContent = `입력 내용을 확인해 주세요. ${invalidFields.length}개 항목을 수정해야 합니다.`;
        subscribeMessage.className = "is-error";
        invalidFields[0].input.focus();
        return false;
    }
    return true;
}

subscriberNameInput.addEventListener("input", () => {
    updateNameCount();
    updateFieldState(formFields[0]);
});
formFields.slice(1).forEach((field) => {
    field.input.addEventListener("input", () => updateFieldState(field));
    field.input.addEventListener("change", () => updateFieldState(field));
});
consultationRequest.addEventListener("change", updateConsultationFields);

subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hasSubmittedForm.value = true;

    if (!validateSubscribeForm()) return;

    const submission = {
        name: subscriberNameInput.value.trim(),
        email: emailInput.value.trim(),
        interest: interestInput.value,
        consultationRequested: consultationRequest.checked,
        phone: consultationRequest.checked ? phoneInput.value.trim() : "",
        contactTime: consultationRequest.checked ? contactTimeInput.value : "",
        submittedAt: new Date().toISOString()
    };

    subscribeButton.disabled = true;
    subscribeButton.textContent = "신청 내용을 저장하고 있습니다...";
    subscribeMessage.className = "is-pending";
    subscribeMessage.textContent = "신청 내용을 저장하고 있습니다. 잠시만 기다려 주세요.";

    window.setTimeout(() => {
        try {
            const savedSubmissions = JSON.parse(localStorage.getItem("postureNewsletterRequests") || "[]");
            savedSubmissions.push(submission);
            localStorage.setItem("postureNewsletterRequests", JSON.stringify(savedSubmissions));
            subscribeMessage.className = "is-success";
            subscribeMessage.textContent = `${submission.name}님, ${submission.email} 주소로 훈련 소식 신청이 완료되었습니다.`;
            subscribeButton.textContent = "신청 완료";
            subscribeResetButton.hidden = false;
        } catch (error) {
            subscribeMessage.className = "is-error";
            subscribeMessage.textContent = "브라우저에 신청 내용을 저장하지 못했습니다. 입력 내용은 남아 있으니 저장 공간을 확인한 뒤 다시 신청해 주세요.";
            subscribeButton.disabled = false;
            subscribeButton.textContent = "다시 신청하기";
        }
    }, 350);
});

subscribeForm.addEventListener("reset", () => {
    window.setTimeout(() => {
        hasSubmittedForm.value = false;
        formFields.forEach((field) => {
            field.error.textContent = "";
            field.input.removeAttribute("aria-invalid");
        });
        consultationFields.hidden = true;
        consultationFields.disabled = true;
        phoneInput.required = false;
        contactTimeInput.required = false;
        updateNameCount();
        subscribeMessage.className = "";
        subscribeMessage.textContent = "필수 항목을 입력하고 관심 주제를 선택해 주세요.";
        subscribeButton.disabled = false;
        subscribeButton.textContent = "훈련 소식 신청하기";
        subscribeResetButton.hidden = true;
    }, 0);
});

const themeButton = document.querySelector("#themeButton");
const nicknameInput = document.querySelector("#nickname");
const nicknameCount = document.querySelector("#nicknameCount");
const agreeCheck = document.querySelector("#agreeCheck");
const agreeMessage = document.querySelector("#agreeMessage");
const startButton = document.querySelector("#startButton");

function handleThemeClick() {
    const isDark = document.body.classList.toggle("dark");

    themeButton.textContent = isDark ? "라이트 테마로 바꾸기" : "다크 테마로 바꾸기";
}

themeButton.addEventListener("click", handleThemeClick);

function handleNicknameInput() {
    const maxLength = nicknameInput.maxLength;
    const currentLength = Math.min(nicknameInput.value.length, maxLength);
    nicknameCount.textContent = currentLength + " / " + maxLength;
}

nicknameInput.addEventListener("input", handleNicknameInput);

function handleAgreeChange() {
    const agreed = agreeCheck.checked;
    
    startButton.disabled = !agreed;
    agreeMessage.textContent = agreed 
        ? "훈련 설정을 시작할 수 있습니다."
        : "동의 후 훈련 설정을 시작할 수 있습니다.";
    
    if (agreed) {
        agreeMessage.classList.add("is-ready");
    } else {
        agreeMessage.classList.remove("is-ready");
    }
}

agreeCheck.addEventListener("change", handleAgreeChange);

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function activateTab(clickedTab) {
    tabs.forEach((tab) => {
        const isSelected = tab === clickedTab;
        tab.classList.toggle("is-active", isSelected);
        tab.setAttribute("aria-selected", String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
    });
    panels.forEach((panel) => {
        const isSelected = panel.id === clickedTab.getAttribute("aria-controls");
        panel.classList.toggle("is-active", isSelected);
        panel.hidden = !isSelected;
    });
}

function handleTabClick(event) {
    activateTab(event.currentTarget);
}

tabs.forEach(function(tab) {
    tab.addEventListener("click", handleTabClick);
    tab.addEventListener("keydown", (event) => {
        const currentIndex = Array.from(tabs).indexOf(event.currentTarget);
        let nextIndex;
        if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex === undefined) return;

        event.preventDefault();
        tabs[nextIndex].focus();
        activateTab(tabs[nextIndex]);
    });
});

const trainingFlow = document.querySelector(".training-flow");
const flowSteps = trainingFlow.querySelectorAll(".step");
const progressItems = trainingFlow.querySelectorAll(".progress-item");
const titleInput = document.querySelector("#training-title");
const titleError = document.querySelector("#title-error");
const titleNext = document.querySelector("#title-next");
const durationRange = document.querySelector("#duration-range");
const durationValue = document.querySelector("#duration-value");
const qnaOption = document.querySelector("#qna-option");
const qnaOptions = document.querySelector("#qna-options");
const optionPrev = document.querySelector("#option-prev");
const optionNext = document.querySelector("#option-next");
const summaryPrev = document.querySelector("#summary-prev");
const finishButton = document.querySelector("#finish-button");
const restartButton = document.querySelector("#restart-button");
const summaryTitle = document.querySelector("#summary-title");
const summaryDuration = document.querySelector("#summary-duration");
const summaryQna = document.querySelector("#summary-qna");
const completedSettingsButton = document.querySelector("#completed-settings-button");
const completedSettings = document.querySelector("#completed-settings");
const completedTitle = document.querySelector("#completed-title");
const completedDuration = document.querySelector("#completed-duration");
const completedQna = document.querySelector("#completed-qna");
const durationValues = ["3", "5", "10"];

const formData = {
    title: "",
    duration: "5",
    qna: false,
    qnaCount: "2"
};

function showStep(index) {
    flowSteps.forEach((step, i) => { step.hidden = i !== index; });
    progressItems.forEach((item, i) => {
        const isCurrent = i === Math.min(index, progressItems.length - 1);
        item.classList.toggle("is-active", isCurrent);
        if (isCurrent) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
    });
    flowSteps[index].querySelector("h3").focus();
}

const recordingDialog = document.querySelector("#recording-dialog");
const recordingCancel = document.querySelector("#recording-cancel");
const recordingConfirm = document.querySelector("#recording-confirm");

function revokeRecordingAgreement() {
    agreeCheck.checked = false;
    trainingFlow.hidden = true;
    handleAgreeChange();
    agreeCheck.focus();
}

startButton.addEventListener("click", () => {
    if(!agreeCheck.checked) return;
    recordingDialog.showModal();
});

recordingCancel.addEventListener("click", () => {
    recordingDialog.close();
    revokeRecordingAgreement();
});

recordingDialog.addEventListener("cancel", revokeRecordingAgreement);
recordingConfirm.addEventListener("click", () => {
    if(!agreeCheck.checked) return;
    recordingDialog.close();
    trainingFlow.hidden = false;
    showStep(0);
    trainingFlow.scrollIntoView({behavior: "smooth"});
    titleInput.focus();
});

function validateTitle() {
    const value = titleInput.value.trim();
    if(!value) {
        titleError.textContent = "훈련 제목을 입력해 주세요.";
        titleInput.classList.add("has-error");
        titleInput.focus();
        return false;
    }
    titleError.textContent = "";
    titleInput.classList.remove("has-error");
    formData.title = value;
    return true;
}

titleNext.addEventListener("click", () => {
    if(!validateTitle()) return;
    showStep(1);
});

durationRange.addEventListener("input", () => {
    durationValue.value = durationValues[durationRange.value] + "분";
});
qnaOption.addEventListener("change", () => {
    qnaOptions.hidden = !qnaOption.checked;
});

optionPrev.addEventListener("click", () => showStep(0));
optionNext.addEventListener("click", () => {
    formData.duration = durationValues[durationRange.value];
    formData.qna = qnaOption.checked;
    const count = document.querySelector('input[name="qna-count"]:checked');
    formData.qnaCount = count.value;
    summaryTitle.textContent = formData.title;
    summaryDuration.textContent = formData.duration + "분";
    summaryQna.textContent = formData.qna ? formData.qnaCount + "개 포함" : "미포함";
    showStep(2);
});

summaryPrev.addEventListener("click", () => showStep(1));
function hideCompletedSettings() {
    completedSettings.hidden = true;
    completedSettingsButton.setAttribute("aria-expanded", "false");
    completedSettingsButton.textContent = "완료한 설정 확인하기";
}

finishButton.addEventListener("click", () => {
    completedTitle.textContent = formData.title;
    completedDuration.textContent = formData.duration + "분";
    completedQna.textContent = formData.qna ? formData.qnaCount + "개 포함" : "미포함";
    exerciseItems = [
        ...exerciseItems,
        {
            id: `custom-${Date.now()}-${exerciseItems.length}`,
            title: formData.title,
            category: "맞춤 훈련",
            duration: `${formData.duration}분`,
            description: `질의응답 ${formData.qna ? `${formData.qnaCount}개 포함` : "미포함"}으로 설정한 자세 연습입니다.`,
            status: "complete"
        }
    ];
    activeRecordFilter = "all";
    recordFilters.forEach((filter) => {
        const isSelected = filter.dataset.status === activeRecordFilter;
        filter.classList.toggle("is-active", isSelected);
        filter.setAttribute("aria-pressed", String(isSelected));
    });
    const saved = persistExerciseItems();
    renderExerciseItems();
    if (saved) recordsMessage.textContent = "완료한 맞춤 훈련을 연습 목록에 저장했습니다.";
    hideCompletedSettings();
    showStep(3);
});

completedSettingsButton.addEventListener("click", () => {
    const isExpanded = completedSettingsButton.getAttribute("aria-expanded") === "true";
    completedSettings.hidden = isExpanded;
    completedSettingsButton.setAttribute("aria-expanded", String(!isExpanded));
    completedSettingsButton.textContent = isExpanded ? "완료한 설정 확인하기" : "설정 내용 숨기기";
});

restartButton.addEventListener("click", () => {
    formData.title = "";
    formData.duration = "5";
    formData.qna = false;
    formData.qnaCount = "2";
    titleInput.value = "";
    titleError.textContent = "";
    titleInput.classList.remove("has-error");
    durationRange.value = "1";
    durationValue.value = "5분";
    qnaOption.checked = false;
    qnaOptions.hidden = true;
    document.querySelector('input[name="qna-count"][value="2"]').checked = true;
    summaryTitle.textContent = "";
    summaryDuration.textContent = "";
    summaryQna.textContent = "";
    hideCompletedSettings();
    showStep(0);
});