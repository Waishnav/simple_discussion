module ApplicationHelper
  def eser_profile_link(user)
    "/users/#{user.id}"
  end
end
