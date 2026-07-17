import type { MissionDefinition } from "../domain/types";
import { MIRROR_ORIENTATION_LABELS } from "../domain/mirror-labels";

const commonModel = "화면의 노란 선은 빛의 진행 방향을 이해하기 위한 가상 표시예요.";
const safety = "실제 거울과 렌즈 실험은 선생님의 안내에 따라 안전하게 해요. 강한 빛이나 햇빛을 눈에 비추거나 렌즈로 모으지 않아요.";

export const MISSIONS: MissionDefinition[] = [
  {
    id: "light-needed-to-see", title: "안내 활동 · 빛이 있어야 보여요", property: "빛이 있어야 보여요",
    request: "관찰창에서 파란 블록을 볼 수 있는 장면을 골라요.", setupLabel: "관찰함 장면",
    conceptHelp: "빛이 물체에 닿고 관찰창까지 이어져야 물체가 보여요.",
    sceneGuide: [{ label: "광원", hint: "빛이 시작하는 곳이에요." }, { label: "파란 블록", hint: "빛이 닿아야 보이는 물체예요." }, { label: "관찰창", hint: "빛이 이어지는 마지막 곳이에요." }],
    setups: [{ id: "dark", label: "광원이 꺼져 있어요" }, { id: "blocked", label: "빛이 블록 앞에서 막혀요" }, { id: "visible", label: "빛이 블록과 관찰창까지 이어져요" }],
    predictions: [{ id: "visible", label: "빛이 블록과 관찰창까지 이어진 장면", matchingSetupIds: ["visible"] }, { id: "dark", label: "광원이 꺼진 장면", matchingSetupIds: ["dark"] }, { id: "blocked", label: "빛이 막힌 장면", matchingSetupIds: ["blocked"] }],
    explanations: [{ id: "see", label: "빛이 물체에 닿고 관찰자 쪽으로 이어져야 보여요." }, { id: "self", label: "물체는 빛 없이도 스스로 보여요." }, { id: "make", label: "거울이 빛을 새로 만들어요." }],
    correctExplanationId: "see", successSetup: "visible", modelNote: commonModel, safetyNote: safety,
  },
  {
    id: "straight-corridor", title: "미션 1 · 곧은 복도 안내등", property: "직진",
    request: "두 가림판의 구멍을 지나 표적에 닿는 빛길을 찾아요.", setupLabel: "가림판 구멍 위치",
    conceptHelp: "직진은 같은 물질 속에서 빛이 곧게 나아가는 모습이에요.",
    sceneGuide: [{ label: "첫 가림판 구멍", hint: "두 구멍이 같은 높이인지 살펴봐요." }, { label: "둘째 가림판 구멍", hint: "첫 구멍과 높이를 비교해요." }, { label: "표적", hint: "두 구멍을 지난 빛이 닿는 곳이에요." }],
    setups: [{ id: "aligned", label: "두 구멍을 가운데로 맞추기" }, { id: "upper-hole", label: "첫 구멍을 위로 옮기기" }],
    predictions: [{ id: "straight", label: "빛이 곧게 통과할 거예요", matchingSetupIds: ["aligned"] }, { id: "up", label: "빛이 위로 휠 거예요" }, { id: "down", label: "빛이 아래로 휠 거예요" }],
    explanations: [{ id: "straight", label: "같은 공기 속에서 빛길을 곧게 나타내어 표적에 닿았어요." }, { id: "avoid", label: "빛이 가림판을 피해 스스로 휘었어요." }, { id: "create", label: "가림판이 빛을 만들었어요." }],
    correctExplanationId: "straight", successSetup: "aligned", modelNote: "이 가상 모형은 같은 공기 속에서 빛이 곧게 나아가는 장면을 단순하게 나타내요.", safetyNote: safety,
  },
  {
    id: "single-mirror-corner", title: "미션 2 · 모퉁이 표지판", property: "반사",
    request: "벽 뒤 표지판 쪽으로 빛의 방향을 바꿔요.", setupLabel: "거울 놓기와 방향",
    conceptHelp: "반사는 거울에서 빛의 방향이 바뀌는 모습이에요.",
    sceneGuide: [{ label: "광원", hint: "빛이 시작하는 곳이에요." }, { label: "거울 자리", hint: "빛이 닿을 거울 자리와 기울기를 비교해요." }, { label: "표지판", hint: "방향이 바뀐 빛이 닿는 곳이에요." }],
    setups: [{ id: "slot-a-down", label: `슬롯 A · ${MIRROR_ORIENTATION_LABELS.slash} 방향 거울`, detail: "↗는 거울이 오른쪽 위로 기울어진 모양이에요." }, { id: "slot-a-up", label: `슬롯 A · ${MIRROR_ORIENTATION_LABELS.backslash} 방향 거울`, detail: "↘는 거울이 오른쪽 아래로 기울어진 모양이에요." }, { id: "slot-b-up", label: `슬롯 B · ${MIRROR_ORIENTATION_LABELS.backslash} 방향 거울`, detail: "↘는 거울이 오른쪽 아래로 기울어진 모양이에요." }],
    predictions: [{ id: "reflect", label: "거울에서 표지판 쪽으로 바뀔 거예요", matchingSetupIds: ["slot-a-down"] }, { id: "wall", label: "직진하다 벽에서 멈출 거예요" }, { id: "through", label: "거울을 통과할 거예요" }],
    explanations: [{ id: "mirror", label: "평면거울에서 빛의 방향이 바뀌어 표지판에 닿았어요." }, { id: "through", label: "빛이 거울을 통과해서 표지판에 닿았어요." }, { id: "made", label: "거울이 새 빛을 만들어 냈어요." }],
    correctExplanationId: "mirror", successSetup: "slot-a-down", modelNote: commonModel, safetyNote: safety,
  },
  {
    id: "two-mirror-viewing-shaft", title: "미션 3 · 두 층 관찰 통로", property: "반사",
    request: "위쪽 물체에서 온 가상 빛길을 아래 관찰창까지 이어 봐요.", setupLabel: "두 거울의 방향",
    conceptHelp: "반사는 거울에서 빛의 방향이 바뀌는 모습이에요.",
    sceneGuide: [{ label: "거울 A", hint: "첫 번째로 방향이 바뀌는 자리예요." }, { label: "거울 B", hint: "두 번째로 방향이 바뀌는 자리예요." }, { label: "아래 관찰창", hint: "두 번 방향이 바뀐 빛이 닿는 곳이에요." }],
    setups: [{ id: "both-turn", label: `거울 A ${MIRROR_ORIENTATION_LABELS.backslash} · 거울 B ${MIRROR_ORIENTATION_LABELS.slash}`, detail: "↘ 다음 ↗ 순서로 거울의 기울기를 살펴봐요." }, { id: "first-only", label: `거울 A ${MIRROR_ORIENTATION_LABELS.backslash}만 선택`, detail: "첫 거울만 선택하면 두 번째 방향 전환은 없어요." }, { id: "wrong-turn", label: `거울 A ${MIRROR_ORIENTATION_LABELS.slash} · 거울 B ${MIRROR_ORIENTATION_LABELS.backslash}`, detail: "↗ 다음 ↘ 순서로 거울의 기울기를 살펴봐요." }],
    predictions: [{ id: "twice", label: "두 번 방향이 바뀔 거예요", matchingSetupIds: ["both-turn"] }, { id: "once", label: "한 번만 방향이 바뀔 거예요", matchingSetupIds: ["first-only"] }, { id: "gone", label: "거울 사이에서 사라질 거예요" }],
    explanations: [{ id: "two-mirrors", label: "두 평면거울에서 반사된 뒤, 새 방향으로 직진해 관찰창에 닿았어요." }, { id: "one-mirror", label: "한 거울만 지나도 항상 아래로 가요." }, { id: "teleport", label: "빛이 거울 사이를 순간이동했어요." }],
    correctExplanationId: "two-mirrors", successSetup: "both-turn", modelNote: commonModel, safetyNote: safety,
  },
  {
    id: "convex-lens-focus", title: "미션 4 · 초점 구조 신호기", property: "굴절",
    request: "평행하게 들어오는 세 가상 빛줄기가 표적 위치에서 모이게 해요.", setupLabel: "볼록렌즈 슬롯",
    conceptHelp: "굴절은 렌즈를 지나며 빛의 방향이 바뀌는 모습이에요. 초점은 빛이 한곳에 모이는 곳이에요.",
    sceneGuide: [{ label: "평행한 세 빛줄기", hint: "나란히 들어오는 세 빛줄기예요." }, { label: "렌즈 슬롯", hint: "렌즈 뒤 어느 곳에서 빛이 모이는지 비교해요." }, { label: "표적", hint: "빛이 모이는 위치와 비교할 곳이에요." }],
    setups: [{ id: "left", label: "렌즈를 왼쪽 슬롯에 놓기" }, { id: "middle", label: "렌즈를 가운데 슬롯에 놓기" }, { id: "right", label: "렌즈를 오른쪽 슬롯에 놓기" }],
    predictions: [{ id: "focus", label: "렌즈 뒤에서 빛이 모일 거예요", matchingSetupIds: ["left", "middle", "right"] }, { id: "parallel", label: "그대로 평행할 거예요" }, { id: "mirror", label: "거울처럼 한쪽으로 꺾일 거예요" }],
    explanations: [{ id: "lens", label: "볼록렌즈에서 평행한 빛이 모이는 방향으로 바뀌어 표적 위치에 모였어요." }, { id: "mirror", label: "렌즈가 거울처럼 빛을 튕겨 냈어요." }, { id: "all", label: "모든 빛은 어떤 렌즈에서도 한 점에 모여요." }],
    correctExplanationId: "lens", successSetup: "middle", modelNote: "볼록렌즈 장면은 평행하게 들어오는 빛이 모이는 경우만 보여 주는 제한된 가상 모형이에요.", safetyNote: safety,
  },
  {
    id: "device-use-match", title: "미션 5 · 장치 역할 연결실", property: "장치 쓰임",
    request: "잠망경·돋보기·카메라의 거울과 렌즈 역할을 한 번에 연결해요.", setupLabel: "세 장치의 역할 고르기",
    conceptHelp: "장치 쓰임은 거울이나 렌즈의 성질을 이용하는 방법이에요.",
    sceneGuide: [{ label: "잠망경", hint: "선택 뒤 거울 역할을 확인해요." }, { label: "돋보기", hint: "선택 뒤 렌즈 역할을 확인해요." }, { label: "카메라", hint: "선택 뒤 렌즈 역할을 확인해요." }],
    setups: [{ id: "correct-match", label: "잠망경: 평면거울 반사 · 돋보기/카메라: 볼록렌즈 굴절" }, { id: "all-mirror", label: "세 장치 모두를 평면거울 반사로 연결" }, { id: "all-lens", label: "세 장치 모두를 볼록렌즈 굴절로 연결" }],
    predictions: [{ id: "uses", label: "장치마다 쓰는 빛의 성질이 다를 거예요", matchingSetupIds: ["correct-match"] }, { id: "same", label: "모든 장치가 같은 방식일 거예요" }, { id: "none", label: "빛의 성질과 관계없을 거예요" }],
    explanations: [{ id: "uses", label: "잠망경은 거울의 반사, 돋보기와 카메라는 렌즈의 쓰임과 연결해 볼 수 있어요." }, { id: "same", label: "거울과 렌즈는 빛길을 똑같이 바꿔요." }, { id: "ignore", label: "장치의 빛길은 살펴볼 필요가 없어요." }],
    correctExplanationId: "uses", successSetup: "correct-match", modelNote: "장치 카드는 핵심 역할만 단순하게 나타낸 가상 자료예요.", safetyNote: safety,
  },
];

export const getMission = (id: MissionDefinition["id"]) => MISSIONS.find((mission) => mission.id === id)!;
