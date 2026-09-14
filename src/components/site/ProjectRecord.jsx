import React, { Suspense } from 'react';
import { fetchBySlug } from '@/lib/siteData';
import { useSuspense } from '@/lib/suspenseCache';
import ProjectMetadata from '@/components/site/ProjectMetadata';
import CenterSpinner from '@/components/site/CenterSpinner';

export default function ProjectRecord({ slug, children }) {
  const project = useSuspense(`project:${slug}`, () => fetchBySlug('Project', slug));
  return (
    <>
      <ProjectMetadata project={project} slug={slug} />
      <Suspense fallback={<CenterSpinner />}>{children(project)}</Suspense>
    </>
  );
}