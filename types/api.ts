// API Route Params Types (Next.js 15+)

export type StoryParams = {
  params: Promise<{ storyId: string }>
}

export type EpisodeParams = {
  params: Promise<{ storyId: string; episodeId: string }>
}

export type SceneParams = {
  params: Promise<{ storyId: string; episodeId: string; sceneId: string }>
}

export type DialogueParams = {
  params: Promise<{ storyId: string; episodeId: string; sceneId: string; dialogueId: string }>
}
