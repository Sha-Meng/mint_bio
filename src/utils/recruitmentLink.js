export const RECRUITMENT_NEWS_SLUG = "join-us-2026-recruitment";
export const RECRUITMENT_ROUTE = `/mintNews/detail/${RECRUITMENT_NEWS_SLUG}`;

export const getRecruitmentUrl = () => {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${RECRUITMENT_ROUTE}`;
};

export const openRecruitmentLink = () => {
  const newWindow = window.open(getRecruitmentUrl(), "_blank", "noopener,noreferrer");
  if (newWindow) {
    newWindow.opener = null;
  }
};
