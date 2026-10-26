const serviceName = "올바른 자세 가이드";
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

function resetTabsAndPanels() {
    tabs.forEach(function(tab) {
        tab.classList.remove("is-active");
        tab.setAttribute("aria-selected", "false");
    });
    panels.forEach(function(panel) {
        panel.classList.remove("is-active");
        panel.hidden = true;
    });
}

function activateTab(clickedTab) {
    const targetSelector = clickedTab.dataset.target;
    const targetPanel = document.querySelector(targetSelector);

    clickedTab.classList.add("is-active");
    clickedTab.setAttribute("aria-selected", "true");

    targetPanel.classList.add("is-active");
    targetPanel.hidden = false;
}

function handleTabClick(event) {
    resetTabsAndPanels();
    activateTab(event.currentTarget);
}

tabs.forEach(function(tab) {
    tab.addEventListener("click", handleTabClick);
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
        item.classList.toggle("is-active", i === index);
    });
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