export function partyJoinedHtml({ caseUrl }: { caseUrl: string }): string {
  return `<p>The other party has joined your Attorney.plus case.</p>
<p>Open it to review and agree: <a href="${caseUrl}">${caseUrl}</a></p>
<p>— Attorney.plus</p>`;
}

export function pleaseAgreeHtml({ caseUrl }: { caseUrl: string }): string {
  return `<p>The other party is ready. Please review and click "I agree" on Attorney.plus.</p>
<p><a href="${caseUrl}">${caseUrl}</a></p>
<p>— Attorney.plus</p>`;
}

export function bothAgreedHtml({ caseUrl }: { caseUrl: string }): string {
  return `<p>Both parties have agreed. Your case advances to intake.</p>
<p><a href="${caseUrl}">${caseUrl}</a></p>
<p>— Attorney.plus</p>`;
}
