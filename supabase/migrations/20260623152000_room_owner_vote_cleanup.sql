create policy "Room owners can clear room votes"
on public.guess_votes for delete
to authenticated
using (public.is_room_owner(room_id));
