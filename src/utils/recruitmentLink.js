export const RECRUITMENT_URL = "https://www.liepin.com/company/13100295/";

export const openRecruitmentLink = () => {
  const newWindow = window.open(RECRUITMENT_URL, "_blank", "noopener,noreferrer");
  if (newWindow) {
    newWindow.opener = null;
  }
};
