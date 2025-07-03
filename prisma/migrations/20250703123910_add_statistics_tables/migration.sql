-- CreateTable
CREATE TABLE "linktree_views" (
    "id" TEXT NOT NULL,
    "linktree_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linktree_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_clicks" (
    "id" TEXT NOT NULL,
    "detail_linktree_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_clicks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "linktree_views" ADD CONSTRAINT "linktree_views_linktree_id_fkey" FOREIGN KEY ("linktree_id") REFERENCES "linktrees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_clicks" ADD CONSTRAINT "link_clicks_detail_linktree_id_fkey" FOREIGN KEY ("detail_linktree_id") REFERENCES "detail_linktrees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
